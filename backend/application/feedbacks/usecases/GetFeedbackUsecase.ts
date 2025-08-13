import { FeedbackRepository } from '@/backend/domain/repositories/FeedbackRepository';
import { Feedback } from '@/backend/domain/entities/Feedback';

export class GetFeedbackUsecase {
  constructor(private feedbackRepository: FeedbackRepository) {}

  async execute(feedbackReportId: number): Promise<Feedback> {
    return await this.feedbackRepository.getFeedback(feedbackReportId);
  }
}
