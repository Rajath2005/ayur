import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
    if (existsSync(envPath)) {
        dotenv.config({ path: envPath, override: false });
    }
}


const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'ayurveda-bot';
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || 'default';

let pinecone: Pinecone | null = null;
let index: any = null;

function initializePinecone() {
    if (!PINECONE_API_KEY) {
        throw new Error('PINECONE_API_KEY is required for RAG functionality. Please add it to your .env file.');
    }

    if (!pinecone) {
        console.log('🔧 Initializing Pinecone client...');
        console.log(`  - Index: ${PINECONE_INDEX}`);
        console.log(`  - Namespace: ${PINECONE_NAMESPACE}`);

        pinecone = new Pinecone({
            apiKey: PINECONE_API_KEY,
        });

        index = pinecone.index(PINECONE_INDEX);
    }

    return { pinecone, index };
}


export interface RetrievedDocument {
    id: string;
    score: number;
    metadata: {
        text?: string;
        title?: string;
        category?: string;
        [key: string]: any;
    };
}

/**
 * Query the Pinecone vector store with an embedding
 * @param embedding - The query embedding vector
 * @param topK - Number of results to return (default: 5)
 * @returns Array of retrieved documents
 */
export async function queryVectorStore(
    embedding: number[],
    topK: number = 5
): Promise<RetrievedDocument[]> {
    try {
        console.log(`🔍 Querying Pinecone (topK=${topK})...`);

        // Initialize Pinecone on first use
        const { index: pineconeIndex } = initializePinecone();

        const queryResponse = await pineconeIndex.namespace(PINECONE_NAMESPACE).query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });

        console.log(`✅ Retrieved ${queryResponse.matches?.length || 0} documents`);

        return (queryResponse.matches || []).map((match: any) => ({
            id: match.id,
            score: match.score || 0,
            metadata: (match.metadata as any) || {},
        }));
    } catch (error: any) {
        console.error('❌ Pinecone query error:', error);
        throw new Error(`Failed to query Pinecone: ${error.message}`);
    }
}

/**
 * Format retrieved documents into a context string for the LLM
 */
export function formatContext(documents: RetrievedDocument[]): string {
    if (documents.length === 0) {
        return '';
    }

    const contextParts = documents.map((doc, idx) => {
        const text = doc.metadata.text || doc.metadata.content || '';
        const title = doc.metadata.title || `Document ${idx + 1}`;
        const category = doc.metadata.category || '';

        return `[${title}${category ? ` - ${category}` : ''}]\n${text}`;
    });

    return contextParts.join('\n\n---\n\n');
}
