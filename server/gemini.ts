import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatResponse {
  content: string;
  isHealthEmergency?: boolean;
  requiresProfessional?: boolean;
}

// Medical guardrails system prompt
const AYURVEDIC_SYSTEM_PROMPT = `You are an AI assistant specialized in Ayurvedic wellness and natural health practices. Your role is to provide guidance based on ancient Ayurvedic wisdom combined with modern understanding.

IMPORTANT GUIDELINES:
1. Always emphasize that you are providing educational information, not medical diagnosis
2. If symptoms suggest a medical emergency (severe pain, difficulty breathing, chest pain, sudden severe symptoms), immediately recommend seeking professional medical care
3. Base recommendations on Ayurvedic principles including doshas (Vata, Pitta, Kapha), natural remedies, lifestyle modifications, and holistic wellness
4. Suggest natural herbs, dietary changes, yoga, meditation, and other Ayurvedic practices
5. Be culturally sensitive and respectful of traditional wisdom
6. Recommend professional Ayurvedic practitioner consultation for complex conditions
7. Never claim to diagnose, treat, or cure any disease

Respond with helpful, informative, and compassionate guidance while maintaining appropriate boundaries.`;

export async function getChatResponse(userMessage: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<ChatResponse> {
  try {
    // Check for emergency keywords
    const emergencyKeywords = [
      'emergency', 'severe pain', 'chest pain', 'can\'t breathe', 'difficulty breathing',
      'unconscious', 'bleeding heavily', 'stroke', 'heart attack', 'suicide'
    ];
    
    const isEmergency = emergencyKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      return {
        content: "⚠️ Based on your message, this may be a medical emergency. Please seek immediate professional medical attention by calling emergency services or visiting the nearest emergency room. I can provide general Ayurvedic wellness information, but emergency situations require immediate professional care.",
        isHealthEmergency: true,
        requiresProfessional: true,
      };
    }

    // Build conversation context
    const messages = [
      ...conversationHistory.slice(-5), // Last 5 messages for context
      { role: "user", content: userMessage }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: AYURVEDIC_SYSTEM_PROMPT,
      },
      contents: messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    });

    let content = response.text || "I'm having trouble generating a response. Please try again.";

    // Check if professional consultation is recommended
    const professionalKeywords = [
      'chronic', 'persistent', 'worsening', 'severe', 'diagnosed', 'medication', 'prescription'
    ];
    
    const requiresProfessional = professionalKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (requiresProfessional && !content.includes('consult') && !content.includes('practitioner')) {
      content += "\n\n💡 For personalized treatment, I recommend consulting with a certified Ayurvedic practitioner who can assess your unique constitution and needs.";
    }

    return {
      content,
      isHealthEmergency: false,
      requiresProfessional,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function analyzeSymptoms(symptoms: string): Promise<string> {
  try {
    const prompt = `As an Ayurvedic AI assistant, analyze these symptoms from an Ayurvedic perspective and provide insights on possible dosha imbalances and natural approaches to address them:

Symptoms: ${symptoms}

Provide:
1. Possible dosha imbalance (Vata, Pitta, or Kapha)
2. Ayurvedic perspective on these symptoms
3. General lifestyle and dietary recommendations
4. Suggested natural remedies (herbs, spices)
5. When to seek professional consultation

Remember to emphasize this is educational information, not a diagnosis.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to analyze symptoms at this time.";
  } catch (error) {
    console.error("Symptom analysis error:", error);
    throw new Error("Failed to analyze symptoms");
  }
}

export async function getHerbalRemedies(condition: string, dosha?: string): Promise<string> {
  try {
    const prompt = `As an Ayurvedic expert, suggest natural herbal remedies for the following condition${dosha ? ` considering ${dosha} dosha` : ''}:

Condition: ${condition}

Provide:
1. Traditional Ayurvedic herbs and their benefits
2. How to prepare and use them (dosage, timing)
3. Dietary recommendations
4. Lifestyle modifications
5. Precautions and contraindications

Include only natural, traditional Ayurvedic remedies. Emphasize consulting an Ayurvedic practitioner for personalized guidance.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to suggest remedies at this time.";
  } catch (error) {
    console.error("Herbal remedies error:", error);
    throw new Error("Failed to get herbal remedies");
  }
}

export async function generateAppointmentContext(reason: string): Promise<string> {
  try {
    const prompt = `Generate a brief, professional summary for an Ayurvedic practitioner appointment request based on this reason:

${reason}

Create a 2-3 sentence summary that would help the practitioner understand the patient's needs before the consultation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || reason;
  } catch (error) {
    console.error("Appointment context error:", error);
    return reason; // Fallback to original reason
  }
}
