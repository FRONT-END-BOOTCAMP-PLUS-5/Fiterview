import { Feedback } from '@/backend/domain/entities/Feedback';
import { OpenAIProvider } from '@/backend/infrastructure/providers/OpenAIProvider';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { toFeedback } from '@/backend/infrastructure/mappers/FeedbackMapper';
import { FeedbackLLMRepository } from '@/backend/domain/repositories/FeedbackLLMRepository';

export class GPTFeedbackRepositoryImpl implements FeedbackLLMRepository {
  private readonly openaiProvider: OpenAIProvider = new OpenAIProvider();

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

    const response = await this.openaiProvider.getResponses().create({
      model: requestFeedbackDto.model,
      instructions: requestFeedbackDto.instructions,
      input,
      max_output_tokens: requestFeedbackDto.maxOutputTokens,
    } as any);

    const outputText = (response as any).output_text as string;

    try {
      const parsed = JSON.parse(outputText);
      return toFeedback(
        requestFeedbackDto.reportId,
        Number(parsed.score),
        Array.isArray(parsed.strength) ? parsed.strength.join(' ') : parsed.strength,
        Array.isArray(parsed.improvement) ? parsed.improvement.join(' ') : parsed.improvement
      );
    } catch (error) {
      const scoreMatch = outputText.match(/(\d+)/);
      const fallbackScore = scoreMatch ? scoreMatch[1] : '50';
      return toFeedback(requestFeedbackDto.reportId, Number(fallbackScore), '', '');
    }
  }
}
