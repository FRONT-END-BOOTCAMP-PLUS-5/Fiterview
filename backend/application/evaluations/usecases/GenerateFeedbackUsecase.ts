import { Feedback } from '@/backend/domain/entities/feedback';
import { IFeedbackRepository } from '@/backend/domain/repositories/IFeedbackRepository';
import { GenerateFeedbackDto } from '@/backend/application/evaluations/dtos/GenerateFeedbackDto';

export class GenerateFeedbackUsecase {
  constructor(private readonly feedbackRepository: IFeedbackRepository) {}

  async execute(dto: GenerateFeedbackDto): Promise<Feedback> {
    const evaluation = await this.feedbackRepository.generateResponse(dto);
    return evaluation;
  }
}
