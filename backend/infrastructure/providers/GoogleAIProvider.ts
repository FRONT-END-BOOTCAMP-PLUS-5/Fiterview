import { GoogleGenAI } from '@google/genai';

export class GoogleAIProvider {
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenAI({ apiKey });
  }

  getClient(): GoogleGenAI {
    return this.genAI;
  }
}
