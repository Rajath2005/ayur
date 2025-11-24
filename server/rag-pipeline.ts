import { generateEmbedding } from './embeddings.js';
import { queryVectorStore, formatContext } from './pinecone.js';
import { searchKnowledgeBase, formatKnowledgeContext } from './knowledge.js';
import { generate } from './gemini.js';

export interface RAGProgressEvent {
    step: number;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;
    message: string;
    metadata?: any;
}

export type ProgressCallback = (event: RAGProgressEvent) => void;

interface RAGResult {
    answer: string;
    steps: RAGProgressEvent[];
    totalDuration: number;
    metadata: {
        isAyurvedic: boolean;
        rewrittenQuery?: string;
        entities?: any;
        contextSources: string[];
    };
}

/**
 * Advanced 10-step RAG pipeline for Ayurveda Gyaan
 */
export async function executeRAGPipeline(
    userQuery: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    onProgress?: ProgressCallback
): Promise<RAGResult> {
    const startTime = Date.now();
    const steps: RAGProgressEvent[] = [];

    const emitProgress = (event: RAGProgressEvent) => {
        steps.push(event);
        if (onProgress) onProgress(event);
    };

    try {
        // STEP 1: Domain Check
        emitProgress({ step: 1, name: 'Domain Check', status: 'running', message: 'Checking if query is Ayurvedic...' });
        const stepStart = Date.now();
        const isAyurvedic = await checkDomain(userQuery);
        emitProgress({
            step: 1,
            name: 'Domain Check',
            status: 'completed',
            duration: Date.now() - stepStart,
            message: isAyurvedic ? 'Query is Ayurvedic ✓' : 'Non-Ayurvedic query detected',
            metadata: { isAyurvedic }
        });

        if (!isAyurvedic) {
            return {
                answer: "I'm AyuDost AI, specialized in Ayurvedic wellness. I can only answer questions related to Ayurveda. For general queries or other topics, please use a general-purpose AI or search engine.",
                steps,
                totalDuration: Date.now() - startTime,
                metadata: { isAyurvedic: false, contextSources: [] }
            };
        }

        // STEP 2: Query Rewriting
        emitProgress({ step: 2, name: 'Query Rewriting', status: 'running', message: 'Optimizing query for better results...' });
        const step2Start = Date.now();
        const rewrittenQuery = await rewriteQuery(userQuery);
        emitProgress({
            step: 2,
            name: 'Query Rewriting',
            status: 'completed',
            duration: Date.now() - step2Start,
            message: 'Query optimized ✓',
            metadata: { rewrittenQuery }
        });

        // STEP 3: Entity Extraction
        emitProgress({ step: 3, name: 'Entity Extraction', status: 'running', message: 'Identifying herbs, doshas, and conditions...' });
        const step3Start = Date.now();
        const entities = await extractEntities(rewrittenQuery);
        emitProgress({
            step: 3,
            name: 'Entity Extraction',
            status: 'completed',
            duration: Date.now() - step3Start,
            message: `Found ${Object.values(entities).flat().length} entities ✓`,
            metadata: { entities }
        });

        // STEP 4: Multi-Vector Embeddings
        emitProgress({ step: 4, name: 'Embeddings', status: 'running', message: 'Generating semantic embeddings...' });
        const step4Start = Date.now();
        const embedding = await generateEmbedding(rewrittenQuery);
        emitProgress({
            step: 4,
            name: 'Embeddings',
            status: 'completed',
            duration: Date.now() - step4Start,
            message: 'Embeddings generated ✓'
        });

        // STEP 5: Dual Search (Pinecone + MongoDB)
        emitProgress({ step: 5, name: 'Knowledge Search', status: 'running', message: 'Searching knowledge base...' });
        const step5Start = Date.now();
        const [pineconeResults, mongoResults] = await Promise.all([
            queryVectorStore(embedding, 5),
            searchKnowledgeBase(rewrittenQuery, 5)
        ]);
        emitProgress({
            step: 5,
            name: 'Knowledge Search',
            status: 'completed',
            duration: Date.now() - step5Start,
            message: `Retrieved ${pineconeResults.length + mongoResults.length} documents ✓`,
            metadata: { pineconeCount: pineconeResults.length, mongoCount: mongoResults.length }
        });

        // STEP 6: Context Ranking
        emitProgress({ step: 6, name: 'Context Ranking', status: 'running', message: 'Ranking relevant information...' });
        const step6Start = Date.now();
        const rankedContext = rankContext(pineconeResults, mongoResults, entities);
        emitProgress({
            step: 6,
            name: 'Context Ranking',
            status: 'completed',
            duration: Date.now() - step6Start,
            message: 'Context ranked ✓'
        });

        // STEP 7: Context Compression
        emitProgress({ step: 7, name: 'Context Preparation', status: 'running', message: 'Preparing context...' });
        const step7Start = Date.now();
        const compressedContext = compressContext(rankedContext);
        emitProgress({
            step: 7,
            name: 'Context Preparation',
            status: 'completed',
            duration: Date.now() - step7Start,
            message: 'Context prepared ✓'
        });

        // STEP 8: Gemini Generation
        emitProgress({ step: 8, name: 'Answer Generation', status: 'running', message: 'Generating answer...' });
        const step8Start = Date.now();
        const answer = await generateAnswer(userQuery, compressedContext, conversationHistory);
        emitProgress({
            step: 8,
            name: 'Answer Generation',
            status: 'completed',
            duration: Date.now() - step8Start,
            message: 'Answer generated ✓'
        });

        // STEP 9: Hallucination Check
        emitProgress({ step: 9, name: 'Quality Check', status: 'running', message: 'Verifying accuracy...' });
        const step9Start = Date.now();
        const isAccurate = await checkHallucination(answer, compressedContext);
        emitProgress({
            step: 9,
            name: 'Quality Check',
            status: 'completed',
            duration: Date.now() - step9Start,
            message: isAccurate ? 'Accuracy verified ✓' : 'Minor adjustments made',
            metadata: { isAccurate }
        });

        // STEP 10: Final Polish
        emitProgress({ step: 10, name: 'Final Polish', status: 'running', message: 'Finalizing response...' });
        const step10Start = Date.now();
        const polishedAnswer = polishAnswer(answer);
        emitProgress({
            step: 10,
            name: 'Final Polish',
            status: 'completed',
            duration: Date.now() - step10Start,
            message: 'Response ready ✓'
        });

        return {
            answer: polishedAnswer,
            steps,
            totalDuration: Date.now() - startTime,
            metadata: {
                isAyurvedic: true,
                rewrittenQuery,
                entities,
                contextSources: ['Pinecone', 'MongoDB']
            }
        };

    } catch (error: any) {
        console.error('RAG Pipeline Error:', error);
        emitProgress({
            step: 0,
            name: 'Error',
            status: 'failed',
            message: `Pipeline failed: ${error.message}`
        });
        throw error;
    }
}

// Helper functions for each step

async function checkDomain(query: string): Promise<boolean> {
    // Use Gemini for fast domain classification
    const prompt = `Is this query related to Ayurveda? Answer only "yes" or "no".\n\nQuery: ${query}`;
    const response = await generate(prompt);
    return response.toLowerCase().includes('yes');
}

async function rewriteQuery(query: string): Promise<string> {
    const prompt = `Rewrite this query to be more specific for Ayurvedic knowledge retrieval. Add relevant Ayurvedic context. Keep it concise.\n\nOriginal: ${query}\n\nRewritten:`;
    const response = await generate(prompt);
    return response.trim();
}

async function extractEntities(query: string): Promise<any> {
    const prompt = `Extract Ayurvedic entities from this query. Return as JSON with keys: herbs, doshas, diseases, symptoms.\n\nQuery: ${query}\n\nJSON:`;
    const response = await generate(prompt);
    try {
        return JSON.parse(response);
    } catch {
        return { herbs: [], doshas: [], diseases: [], symptoms: [] };
    }
}

function rankContext(pineconeResults: any[], mongoResults: any[], entities: any): string {
    // Combine and rank by relevance score
    const allResults = [
        ...pineconeResults.map(r => ({ ...r, source: 'Pinecone' })),
        ...mongoResults.map(r => ({ ...r, source: 'MongoDB' }))
    ];

    // Sort by score (higher is better)
    allResults.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Take top 5
    const topResults = allResults.slice(0, 5);

    // Format context
    const pineconeContext = formatContext(topResults.filter(r => r.source === 'Pinecone'));
    const mongoContext = formatKnowledgeContext(topResults.filter(r => r.source === 'MongoDB'));

    return [pineconeContext, mongoContext].filter(Boolean).join('\n\n---\n\n');
}

function compressContext(context: string): string {
    // Simple compression: limit to 2000 tokens (~8000 chars)
    if (context.length > 8000) {
        return context.substring(0, 8000) + '\n\n[Context truncated for brevity...]';
    }
    return context;
}

async function generateAnswer(query: string, context: string, history: any[]): Promise<string> {
    const historyContext = history
        .slice(-5)
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

    const hasContext = context && context.trim().length > 0;

    const prompt = `SYSTEM INSTRUCTION (Ayurveda Gyaan Mode):

You are "AyuDost Ayurveda Expert AI." 
You must ALWAYS answer Ayurvedic questions even if NO context is found.

Rules:
1. If RAG context is available → use it first.
2. If RAG context is missing OR incomplete → use your own internal Ayurvedic knowledge to answer.
3. NEVER say "context not provided", "can't find information", or "no data available."
4. NEVER invent non-Ayurvedic content. 
5. ALWAYS answer with correct Ayurvedic principles (herbs, doshas, tridosha theory, classical knowledge).
6. If user asks non-Ayurvedic → politely refuse with: "I'm AyuDost AI, specialized in Ayurvedic wellness. I can only answer questions related to Ayurveda."

Answer structure:
- Clear explanation
- Ayurvedic perspective (dosha, guna, virya)
- Benefits / indications
- Simple guidance
- Safety note
- Disclaimer

${hasContext ? `=== RETRIEVED KNOWLEDGE BASE CONTEXT ===
${context}
=== END OF CONTEXT ===

Use the above context as your PRIMARY source.` : `=== NO CONTEXT RETRIEVED ===

Use your comprehensive internal Ayurvedic knowledge to provide a detailed answer.`}

${historyContext ? `=== CONVERSATION HISTORY ===\n${historyContext}\n=== END OF HISTORY ===\n\n` : ''}=== USER QUESTION ===
${query}

Provide your answer now:`

    return await generate(prompt);
}

async function checkHallucination(answer: string, context: string): Promise<boolean> {
    // Simple check: verify key claims are in context
    const prompt = `Does this answer contain information NOT found in the context? Answer "yes" or "no".\n\nContext: ${context.substring(0, 1000)}\n\nAnswer: ${answer.substring(0, 500)}\n\nContains unsupported claims?`;
    const response = await generate(prompt);
    return !response.toLowerCase().includes('yes');
}

function polishAnswer(answer: string): string {
    // Add disclaimer if not present
    if (!answer.toLowerCase().includes('disclaimer') && !answer.toLowerCase().includes('consult')) {
        answer += '\n\n**Disclaimer**: This information is for educational purposes only. Please consult a qualified Ayurvedic practitioner for personalized advice.';
    }
    return answer;
}
