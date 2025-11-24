import { GoogleGenerativeAI } from '@google/generative-ai';
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


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function initializeGenAI() {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required for embeddings. Please add it to your .env file.');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    return genAI;
}

/**
 * Generate embedding for a given text using Google's text-embedding-004 model
 * @param text - The text to embed
 * @returns The embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        console.log(`🔄 Generating embedding for text (${text.length} chars)...`);

        const ai = initializeGenAI();
        const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);

        const embedding = result.embedding.values;

        console.log(`✅ Generated embedding (dimension: ${embedding.length})`);

        return embedding;
    } catch (error: any) {
        console.error('❌ Embedding generation error:', error);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
}
