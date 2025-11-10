import { getChatResponse } from "./gemini";

export async function analyzeSymptoms(symptoms: string): Promise<string> {
  const prompt = `You are an Ayurvedic assistant. Analyze the following symptoms and provide a concise, safe, non-diagnostic summary and next steps:\n\nSymptoms: ${symptoms}`;
  const resp = await getChatResponse(prompt, []);
  return resp.content;
}

export async function getHerbalRemedies(condition: string, dosha?: string): Promise<string[]> {
  const prompt = `You are an Ayurvedic assistant. Suggest gentle, general herbal remedies for the following condition: ${condition}${dosha ? ` for dosha: ${dosha}` : ""}. Provide a short bulleted list.`;
  const resp = await getChatResponse(prompt, []);
  // Split into lines and return non-empty lines
  return resp.content.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

export async function generateAppointmentContext(reason: string): Promise<string> {
  const prompt = `You are an Ayurvedic assistant. Create a short, clear context summary for a practitioner appointment based on: ${reason}. Keep it under 200 characters.`;
  const resp = await getChatResponse(prompt, []);
  return resp.content;
}
