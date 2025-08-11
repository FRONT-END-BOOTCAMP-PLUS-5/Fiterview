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

  getResponses(): OpenAI.Responses {
    return this.openai.responses;
  }
}

// Also export the default function for backward compatibility
let cachedClient: OpenAI | null = null;

export default function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}
