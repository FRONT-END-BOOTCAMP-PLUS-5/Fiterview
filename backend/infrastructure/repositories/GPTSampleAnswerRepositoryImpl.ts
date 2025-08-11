import { PrAnswerRepository } from './PrAnswerRepository';
import { OpenAIProvider } from '@/backend/infrastructure/providers/OpenAIProvider';
import { ISampleAnswerRepository } from '@/backend/domain/repositories/ISampleAnswerRepository';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswersDto';
import { SampleAnswers } from '@/backend/domain/entities/SampleAnswers';
import { SampleAnswerMapper } from '../mappers/SampleAnswerMapper';

export class GPTSampleAnswerRepository implements ISampleAnswerRepository {
  private readonly questionsRepository: PrAnswerRepository = new PrAnswerRepository();
  private readonly openaiProvider: OpenAIProvider = new OpenAIProvider();

  constructor(gptSettings: GenerateSampleAnswersDto) {
    if (!gptSettings?.model) {
      throw new Error('OpenAI model is required in constructor.');
    }
  }

  private createInputToGpt(questionContentArray: string[]) {
    let input = '';
    for (let i = 0; i < questionContentArray.length; i++) {
      input += `Question: ${questionContentArray[i]}\n\n`;
    }
    return input;
  }

  public async generateResponse(
    generateBestAnswersDto: GenerateSampleAnswersDto
  ): Promise<SampleAnswers> {
    const questionContentArray = await this.questionsRepository.getQuestion(
      generateBestAnswersDto.questions_report_id
    );

    const input = this.createInputToGpt(questionContentArray);

    const response = await this.openaiProvider.getResponses().create({
      model: generateBestAnswersDto.model,
      instructions: generateBestAnswersDto.instructions,
      input,
      max_output_tokens: generateBestAnswersDto.maxOutputTokens,
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

      return SampleAnswerMapper.toSampleAnswers(
        generateBestAnswersDto.questions_report_id,
        parsedAnswers
      );
    } catch (error) {
      return SampleAnswerMapper.toSampleAnswers(generateBestAnswersDto.questions_report_id, []);
    }
  }
}
