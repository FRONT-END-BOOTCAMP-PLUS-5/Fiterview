import OpenAI from 'openai';

export interface CreateResponseParams {
  model: string;
  instructions?: string;
  input: string | unknown;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface CreateResponseResult {
  outputText: string;
  raw: any;
}

export async function generateOpenAIResponse({
  model,
  instructions,
  input,
  temperature,
  maxOutputTokens,
}: CreateResponseParams): Promise<CreateResponseResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model,
    instructions,
    input,
    temperature,
    max_output_tokens: maxOutputTokens,
  } as any);

  const outputText = (response as any).output_text as string;
  return { outputText, raw: response as any };
}
