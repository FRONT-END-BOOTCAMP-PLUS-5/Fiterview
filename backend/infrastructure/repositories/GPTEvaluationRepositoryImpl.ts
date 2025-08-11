import { Evaluation } from '@/backend/domain/entities/Evaluation';
import { IEvaluationRepository } from '@/backend/domain/repositories/IEvaluationRepository';
import { DbQARepository } from './DbQARepository';
import { OpenAIProvider } from '@/backend/infrastructure/providers/OpenAIProvider';
import { GenerateEvaluationDto } from '@/backend/application/evaluations/dtos/GenerateEvaluationDto';
import { EvaluationMapper } from '../mappers/EvaluationMapper';

export class GPTEvaluationRepository implements IEvaluationRepository {
  private readonly questionsRepository: DbQARepository = new DbQARepository();
  private readonly openaiProvider: OpenAIProvider = new OpenAIProvider();

  constructor(gptSettings: GenerateEvaluationDto) {
    if (!gptSettings?.model) {
      throw new Error('OpenAI model is required in constructor.');
    }
    // Remove these lines as properties don't exist on the class
    // Questions and answers should be loaded dynamically when needed
  }

  private createInputToGpt(questionContentArray: string[], answerContentArray: string[]) {
    let input = '';
    for (let i = 0; i < questionContentArray.length; i++) {
      input += `Question: ${questionContentArray[i]}\n\nCandidate Answer: ${answerContentArray[i]}\n\n`;
    }
    return input;
  }

  public async generateResponse(generateEvaluationDto: GenerateEvaluationDto): Promise<Evaluation> {
    const questionContentArray = await this.questionsRepository.getQuestion(
      generateEvaluationDto.questions_report_id
    );
    const answerContentArray = await this.questionsRepository.getAnswer(
      generateEvaluationDto.answers_report_id
    );

    const input = this.createInputToGpt(questionContentArray, answerContentArray);

    const response = await this.openaiProvider.getResponses().create({
      model: generateEvaluationDto.model,
      instructions: generateEvaluationDto.instructions,
      input,
      max_output_tokens: generateEvaluationDto.maxOutputTokens,
    } as any);

    const outputText = (response as any).output_text as string;

    try {
      const parsed = JSON.parse(outputText);
      return EvaluationMapper.toEvaluation(generateEvaluationDto.questions_report_id, parsed.score);
    } catch (error) {
      const scoreMatch = outputText.match(/(\d+)/);
      const fallbackScore = scoreMatch ? scoreMatch[1] : '50';
      return EvaluationMapper.toEvaluation(
        generateEvaluationDto.questions_report_id,
        fallbackScore
      );
    }
  }
}
