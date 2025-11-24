import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple .env locations
const envPaths = [
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), ".env"),
];

console.log("🔍 Checking .env file locations:");
for (const envPath of envPaths) {
  console.log(`  - ${envPath}: ${existsSync(envPath) ? "✅ Found" : "❌ Not found"}`);
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("\n📋 Environment Variables Check:");
console.log(`  - GEMINI_API_KEY: ${GEMINI_API_KEY ? `✅ Present (${GEMINI_API_KEY.substring(0, 8)}...)` : "❌ Missing"}`);
console.log(`  - NODE_ENV: ${process.env.NODE_ENV || "development"}`);

if (!GEMINI_API_KEY) {
  console.error("\n❌ ERROR: GEMINI_API_KEY is missing!");
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Try these models in order until one works
const MODEL_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-pro-latest"
];

let workingModel: string | null = null;

export interface ChatResponse {
  content: string;
  isHealthEmergency?: boolean;
  requiresProfessional?: boolean;
}

async function getWorkingModel(): Promise<string> {
  if (workingModel) {
    return workingModel;
  }

  console.log("🔍 Finding compatible Gemini model...");

  for (const modelName of MODEL_FALLBACKS) {
    try {
      console.log(`   Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Try a simple request to verify it works
      const result = await model.generateContent("Hi");
      if (result?.response?.text()) {
        workingModel = modelName;
        console.log(`   ✅ Found working model: ${modelName}`);
        return modelName;
      }
    } catch (err: any) {
      console.log(`   ❌ ${modelName} failed: ${err.message}`);
      continue;
    }
  }

  throw new Error("No compatible Gemini model found. Please check your API key.");
}

export async function generate(prompt: string): Promise<string> {
  try {
    console.log("\n🔄 Initializing Gemini model...");

    // Get a working model
    const modelName = await getWorkingModel();

    const model: GenerativeModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    console.log(`✅ Using model: ${modelName}`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);

    console.log("🚀 Sending request to Gemini API...");
    const result = await model.generateContent(prompt);

    console.log("📥 Received response from Gemini API");

    if (!result?.response) {
      throw new Error("Empty response from Gemini API");
    }

    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty text response from Gemini");
    }

    console.log(`✅ Response received (${text.length} characters)`);
    console.log(`📄 Preview: ${text.slice(0, 100)}...`);

    return text;

  } catch (err: any) {
    console.error("\n❌ GEMINI API ERROR:");
    console.error("  Message:", err?.message || "Unknown error");
    console.error("  Type:", err?.constructor?.name);

    if (err?.status) {
      console.error("  Status:", err.status);
    }
    if (err?.statusText) {
      console.error("  Status Text:", err.statusText);
    }

    // Return user-friendly error messages
    if (err?.message?.includes("API key")) {
      return "⚠️ Configuration error: Invalid API key. Please check your Gemini API key.";
    }
    if (err?.message?.includes("quota") || err?.message?.includes("limit")) {
      return "⚠️ API quota exceeded. Please try again later.";
    }
    if (err?.message?.includes("blocked") || err?.message?.includes("safety")) {
      return "⚠️ Response blocked by safety filters. Please rephrase your question.";
    }

    return "⚠️ I'm experiencing technical difficulties. Please try again in a moment.";
  }
}

export async function getChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  mode: 'GYAAN' | 'VAIDYA' | 'DRISHTI' | 'LEGACY' = 'GYAAN'
): Promise<ChatResponse> {
  console.log("\n💬 Processing chat request:");
  console.log(`  Mode: ${mode}`);
  console.log(`  User message: ${userMessage.substring(0, 50)}...`);
  console.log(`  History length: ${conversationHistory.length} messages`);

  // Build conversation context
  const historyContext = conversationHistory
    .slice(-10) // Include more context for diagnostic flow
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  let systemPrompt = "";
  let retrievedContext = "";

  if (mode === 'VAIDYA') {
    systemPrompt = `You are Vaidya Chat, an advanced AI Ayurvedic Practitioner. Your goal is to conduct a thorough diagnostic consultation with the user to identify potential health imbalances (Vikriti) and suggest Ayurvedic remedies.

PROTOCOL:
1. **Symptom Gathering**: Ask specific, targeted questions to understand the user's symptoms, duration, severity, and associated factors (diet, sleep, stress). Do NOT ask all questions at once. Ask 1-2 relevant questions at a time to keep the conversation natural.
2. **Dosha Analysis**: Try to determine the user's dominant Dosha (Vata, Pitta, Kapha) based on their answers.
3. **Diagnosis & Remedy**: Once you have sufficient information (usually after 3-5 exchanges), provide a detailed analysis including:
   - Potential Dosha imbalance.
   - Suggested lifestyle changes (Dinacharya).
   - Dietary recommendations (Pathya/Apathya).
   - Simple herbal remedies.
4. **Tone**: Be professional, empathetic, and authoritative yet caring, like a wise Ayurvedic doctor.

IMPORTANT:
- If the user mentions severe symptoms (chest pain, difficulty breathing, etc.), IMMEDIATELY advise them to see a doctor and do not attempt to diagnose.
- Always maintain the persona of a Vaidya (Ayurvedic Doctor).
- Keep responses concise during the questioning phase.

DISCLAIMER: Always imply or state that this is an AI analysis and not a substitute for professional medical advice.`;
  } else if (mode === 'GYAAN') {
    // Use advanced 10-step RAG pipeline with Pinecone
    try {
      const { executeRAGPipeline } = await import('./rag-pipeline.js');

      console.log('🚀 Starting advanced RAG pipeline with Pinecone...');

      const result = await executeRAGPipeline(
        userMessage,
        conversationHistory,
        (event) => {
          // Log progress events
          console.log(`[Step ${event.step}] ${event.name}: ${event.message}${event.duration ? ` (${event.duration}ms)` : ''}`);
        }
      );

      console.log(`✅ RAG pipeline completed in ${result.totalDuration}ms`);

      return {
        content: result.answer,
      };
    } catch (error: any) {
      console.error('❌ RAG pipeline failed:', error.message);
      console.log('⚠️ Falling back to simple mode');

      // Fallback to simple Gemini response with enhanced prompt
      systemPrompt = `You are AyuDost AI, an expert Ayurvedic wellness & lifestyle assistant.

You have comprehensive knowledge of:
- Ayurvedic principles (Tridosha theory, Prakriti, Vikriti)
- Herbs and their properties (Ashwagandha, Turmeric, Triphala, etc.)
- Ayurvedic treatments and remedies
- Dinacharya (daily routines) and Ritucharya (seasonal routines)
- Ayurvedic diet and nutrition
- Classical Ayurvedic texts (Charaka Samhita, Sushruta Samhita, etc.)

Guidelines:
1. Provide accurate, detailed Ayurvedic information
2. Explain concepts in simple, accessible language
3. Include practical applications and remedies
4. Always add safety disclaimers
5. STRICT RULE: Only answer Ayurvedic questions. If the question is not related to Ayurveda, politely decline.
6. Never provide medical diagnosis or replace professional medical advice.

Your tone is friendly, encouraging, and holistic.`;
    }
  } else {
    // Legacy mode
    systemPrompt = `You are AyuDost AI, an Ayurvedic wellness & lifestyle assistant.
You provide safe, general guidance based on Ayurvedic principles.
You never provide medical diagnosis or replace professional medical advice.
Your tone is friendly, encouraging, and holistic.`;
  }

  const prompt = `${systemPrompt}

${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ""}Current interaction:
User: ${userMessage}

Please provide a response following the protocol above:`;

  const response = await generate(prompt);

  return {
    content: response,
  };
}