import OpenAI from 'openai';

export class OpenAIProvider {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  getClient(): OpenAI {
    return this.openai;
  }
}
