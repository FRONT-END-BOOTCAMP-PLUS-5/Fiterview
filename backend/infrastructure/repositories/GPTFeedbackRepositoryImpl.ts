import { Feedback } from '@/backend/domain/entities/Feedback';
import getOpenAIClient from '@/backend/infrastructure/providers/OpenAIProvider';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { toFeedback } from '@/backend/infrastructure/mappers/FeedbackMapper';
import { FeedbackLLMRepository } from '@/backend/domain/repositories/FeedbackLLMRepository';

export class GPTFeedbackRepositoryImpl implements FeedbackLLMRepository {
  constructor(gptSettings: RequestFeedbackDto) {
    if (!gptSettings?.model) {
      throw new Error('OpenAI model is required in constructor.');
    }
  }

  private createInputToGpt(
    pairs: { question: string; sampleAnswer?: string | null; userAnswer?: string | null }[]
  ) {
    return pairs
      .map(
        (p, idx) =>
          `Q${idx + 1}: ${p.question}\nSample Answer: ${p.sampleAnswer ?? ''}\nUser Answer: ${p.userAnswer ?? ''}`
      )
      .join('\n\n');
  }

  public async generateFeedback(requestFeedbackDto: RequestFeedbackDto): Promise<Feedback> {
    const input = this.createInputToGpt(requestFeedbackDto.pairs);

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: requestFeedbackDto.model,
      instructions: requestFeedbackDto.instructions,
      input,
      max_output_tokens: requestFeedbackDto.maxOutputTokens,
    } as any);

    const outputText = (response as any).output_text as string;

    try {
      const parsed = JSON.parse(outputText);
      const strength = Array.isArray((parsed as any).strength)
        ? ((parsed as any).strength as unknown[]).map((v) => String(v))
        : typeof (parsed as any).strength === 'string'
          ? String((parsed as any).strength)
              .split(/(?<=[.!?])\s+|\n+/)
              .filter(Boolean)
          : [];
      const improvement = Array.isArray((parsed as any).improvement)
        ? ((parsed as any).improvement as unknown[]).map((v) => String(v))
        : typeof (parsed as any).improvement === 'string'
          ? String((parsed as any).improvement)
              .split(/(?<=[.!?])\s+|\n+/)
              .filter(Boolean)
          : [];

      return toFeedback(
        requestFeedbackDto.reportId,
        Number((parsed as any).score),
        strength,
        improvement
      );
    } catch (error) {
      const scoreMatch = outputText.match(/(\d+)/);
      const fallbackScore = scoreMatch ? scoreMatch[1] : '50';
      return toFeedback(requestFeedbackDto.reportId, Number(fallbackScore), [], []);
    }
  }
}
