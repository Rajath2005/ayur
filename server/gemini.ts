import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables from /server/.env
dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in /server/.env");
  process.exit(1); // Exit if API key is missing
}

// Log key presence (but not the actual key)
console.log("✅ Gemini API Key loaded:", GEMINI_API_KEY ? "Present" : "Missing");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export interface ChatResponse {
  content: string;
  isHealthEmergency?: boolean;
  requiresProfessional?: boolean;
}

async function generate(prompt: string): Promise<string> {
  try {
    // Initialize model with safety settings
    console.log("🔄 Initializing Gemini model...");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // Using default safety settings
    });

    // Validate if model is initialized
    if (!model) {
      throw new Error("Failed to initialize Gemini model");
    }
    console.log("✅ Gemini model initialized successfully");

    // Generate content with retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        
        // Check if we have a valid response
        if (!result?.response) {
          throw new Error("Empty response from Gemini");
        }

        const text = await result.response.text();
        
        if (!text || text.trim().length === 0) {
          throw new Error("Empty text response");
        }

        console.log("✅ Gemini Response:", text.slice(0, 80));
        return text;
      } catch (retryError) {
        attempts++;
        if (attempts === maxAttempts) {
          throw retryError;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
    
    throw new Error("Max retry attempts reached");
  } catch (err: any) {
    console.error("❌ Gemini ERROR →", err?.message || err, "\nStack:", err?.stack);
    if (err?.message?.includes("API key")) {
      return "Configuration error: Invalid or missing API key. Please check server configuration.";
    }
    return "I'm experiencing technical difficulties. Please try again in a moment.";
  }
}

export async function getChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<ChatResponse> {
  const prompt = `
You are AyurChat, an Ayurvedic wellness & lifestyle assistant.
Provide safe, general guidance. Avoid medical diagnosis.

Conversation so far:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n")}

User: ${userMessage}
AI:
`;

  const response = await generate(prompt);

  return { content: response };
}
