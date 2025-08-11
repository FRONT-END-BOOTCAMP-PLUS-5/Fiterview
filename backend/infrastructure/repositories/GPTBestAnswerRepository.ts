import { BestAnswersEntity } from '@/backend/domain/entities/BestAnswersEntity';
import { DbQARepository } from './DbQARepository';
import { OpenAIProvider } from '@/backend/infrastructure/providers/OpenAIProvider';
import { IBestAnswerEntity } from '@/backend/domain/repositories/IBestAnswerEntity';
import { GenerateBestAnswersDto } from '@/backend/application/questions/dtos/GenerateBestAnswersDto';

export class GPTBestAnswerRepository implements IBestAnswerEntity {
  private readonly questionsRepository: DbQARepository = new DbQARepository();
  private readonly openaiProvider: OpenAIProvider = new OpenAIProvider();

  constructor(gptSettings: GenerateBestAnswersDto) {
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
    generateBestAnswersDto: GenerateBestAnswersDto
  ): Promise<BestAnswersEntity> {
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
      return new BestAnswersEntity(
        generateBestAnswersDto.questions_report_id,
        outputText.split('\n')
      );
    } catch (error: unknown) {
      return new BestAnswersEntity(generateBestAnswersDto.questions_report_id, []);
    }
  }
}
