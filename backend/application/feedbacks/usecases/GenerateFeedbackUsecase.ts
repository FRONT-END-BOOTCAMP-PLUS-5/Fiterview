import { IFeedbackRepository } from '@/backend/domain/repositories/IFeedbackRepository';
import { Feedback } from '@/backend/domain/entities/feedback';
import { GenerateFeedbackDto } from '../dtos/GenerateFeedbackDto';

export class GenerateFeedbackUsecase {
  constructor(private readonly feedbackRepo: IFeedbackRepository) {}

  async execute(dto: GenerateFeedbackDto): Promise<Feedback> {
    const feedback = await this.feedbackRepo.generateFeedback(dto.reportId);
    return feedback;
  }
}
