import OpenAI from 'openai';

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
