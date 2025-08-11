import { Feedback } from '@/backend/domain/entities/feedback';
import { IFeedbackRepository } from '@/backend/domain/repositories/IFeedbackRepository';
import { PrAnswerRepository } from './PrAnswerRepository';
import { OpenAIProvider } from '@/backend/infrastructure/providers/OpenAIProvider';
import { GenerateFeedbackDto } from '@/backend/application/evaluations/dtos/GenerateFeedbackDto';
import { FeedbackMapper } from '../mappers/FeedbackMapper';

export class GPTFeedbackRepository implements IFeedbackRepository {
  private readonly questionsRepository: PrAnswerRepository = new PrAnswerRepository();
  private readonly openaiProvider: OpenAIProvider = new OpenAIProvider();

  constructor(gptSettings: GenerateFeedbackDto) {
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

  public async generateResponse(generateEvaluationDto: GenerateFeedbackDto): Promise<Feedback> {
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
      return FeedbackMapper.toFeedback(
        generateEvaluationDto.questions_report_id,
        parsed.score,
        parsed.strength,
        parsed.improvement
      );
    } catch (error) {
      const scoreMatch = outputText.match(/(\d+)/);
      const fallbackScore = scoreMatch ? scoreMatch[1] : '50';
      return FeedbackMapper.toFeedback(
        generateEvaluationDto.questions_report_id,
        fallbackScore,
        '',
        ''
      );
    }
  }
}
