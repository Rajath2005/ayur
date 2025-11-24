import { MongoClient, Db, Collection } from 'mongodb';
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


const MONGODB_URI = process.env.MONGODB_URI;

let client: MongoClient | null = null;
let db: Db | null = null;

// Initialize MongoDB connection
async function connectToMongoDB() {
    if (db) return db;

    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured. Please add it to your .env file.');
    }

    console.log('🔧 Connecting to MongoDB Knowledge Base...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('ayurveda_kb'); // Knowledge base database
    console.log('✅ Connected to MongoDB Knowledge Base');
    return db;
}


export interface KnowledgeDocument {
    _id?: string;
    title: string;
    content: string;
    category: 'herb' | 'disease' | 'remedy' | 'general';
    keywords?: string[];
    metadata?: Record<string, any>;
}

/**
 * Search MongoDB knowledge base using text search and keyword matching
 * @param query - The search query
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of matching documents
 */
export async function searchKnowledgeBase(
    query: string,
    limit: number = 5
): Promise<KnowledgeDocument[]> {
    try {
        console.log(`🔍 Searching MongoDB Knowledge Base for: "${query.substring(0, 50)}..."`);

        const database = await connectToMongoDB();
        const collections = ['herbs', 'diseases', 'remedies', 'general'];

        const allResults: KnowledgeDocument[] = [];

        // Search across all collections
        for (const collectionName of collections) {
            const collection: Collection = database.collection(collectionName);

            // Create text index if it doesn't exist (idempotent)
            try {
                await collection.createIndex({ title: 'text', content: 'text', keywords: 'text' });
            } catch (err) {
                // Index might already exist, ignore
            }

            // Text search
            const results = await collection
                .find({ $text: { $search: query } })
                .project({ score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .toArray();

            // Map to KnowledgeDocument format
            const mappedResults = results.map((doc: any) => ({
                _id: doc._id?.toString(),
                title: doc.title || doc.name || 'Untitled',
                content: doc.content || doc.description || JSON.stringify(doc),
                category: collectionName.slice(0, -1) as any, // Remove 's' from collection name
                keywords: doc.keywords || doc.tags || [],
                metadata: doc,
            }));

            allResults.push(...mappedResults);
        }

        // Sort by relevance and limit
        const sortedResults = allResults
            .sort((a, b) => (b.metadata?.score || 0) - (a.metadata?.score || 0))
            .slice(0, limit);

        console.log(`✅ Found ${sortedResults.length} documents in MongoDB`);

        return sortedResults;
    } catch (error: any) {
        console.error('❌ MongoDB search error:', error);
        return []; // Return empty array on error, don't fail the entire request
    }
}

/**
 * Format MongoDB knowledge documents into a context string
 */
export function formatKnowledgeContext(documents: KnowledgeDocument[]): string {
    if (documents.length === 0) {
        return '';
    }

    const contextParts = documents.map((doc) => {
        return `[${doc.title} - ${doc.category}]\n${doc.content}`;
    });

    return contextParts.join('\n\n---\n\n');
}

/**
 * Close MongoDB connection (call on server shutdown)
 */
export async function closeMongoDB() {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}
