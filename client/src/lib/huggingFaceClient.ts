import axios from 'axios';

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const HF_MODEL_URL = import.meta.env.VITE_HF_MODEL_URL || 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export class HuggingFaceClient {
  private apiKey: string;
  private modelUrl: string;

  constructor(apiKey: string, modelUrl: string) {
    this.apiKey = apiKey;
    this.modelUrl = modelUrl;
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const response = await axios.post<HuggingFaceResponse>(
        this.modelUrl,
        {
          inputs: {
            image: imageBase64,
            text: prompt,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.generated_text || 'Analysis completed successfully.';
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }
}

export const huggingFaceClient = new HuggingFaceClient(HF_API_KEY, HF_MODEL_URL);
