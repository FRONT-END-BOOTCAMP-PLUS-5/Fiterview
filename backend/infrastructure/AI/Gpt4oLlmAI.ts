import getOpenAIClient from '@/utils/AIs/OpenAI';
import { toFeedback } from '@/backend/infrastructure/mappers/FeedbackMapper';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswerDto';
import type { Gpt4oLlmAI as Gpt4oLlmAIInterface } from '@/backend/domain/AI/LlmAI';
import type { Feedback } from '@/backend/domain/entities/Feedback';

export class Gpt4oLlmAI implements Gpt4oLlmAIInterface {
  private readonly defaultSettings?: GenerateSampleAnswersDto;
  constructor(settings?: GenerateSampleAnswersDto) {
    this.defaultSettings = settings;
  }

  private createInputToGpt(questionContentArray: string[]) {
    let input = '';
    for (let i = 0; i < questionContentArray.length; i++) {
      input += `Question: ${questionContentArray[i]}\n\n`;
    }
    return input;
  }

  public async generateSampleAnswer(
    generateSampleAnswersDto: GenerateSampleAnswersDto
  ): Promise<string> {
    // fall back to default settings if some fields are missing
    const model = generateSampleAnswersDto?.model ?? this.defaultSettings?.model ?? 'gpt-4o';
    const instructions =
      generateSampleAnswersDto?.instructions ?? this.defaultSettings?.instructions ?? '';
    const max_output_tokens =
      generateSampleAnswersDto?.maxOutputTokens ?? this.defaultSettings?.maxOutputTokens ?? 1000;

    const questionContentArray = generateSampleAnswersDto.input
      .split('\n')
      .filter((s) => s.trim().length > 0);

    const input = this.createInputToGpt(questionContentArray);

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model,
      instructions,
      input,
      max_output_tokens,
    } as any);

    const outputText = (response as any).output_text as string;

    try {
      // Try to parse as JSON first (in case AI returns proper JSON array)
      let parsedAnswers: string[];
      try {
        const jsonMatch = outputText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedAnswers = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to splitting by newlines if no JSON array found
          parsedAnswers = outputText.split('\n').filter((line) => line.trim().length > 0);
        }
      } catch (parseError) {
        // If JSON parsing fails, fallback to splitting by newlines
        parsedAnswers = outputText.split('\n').filter((line) => line.trim().length > 0);
      }

      return parsedAnswers.join('\n');
    } catch (error) {
      return '';
    }
  }

  private createInputToGpt4(
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
    const input = this.createInputToGpt4(requestFeedbackDto.pairs);

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
