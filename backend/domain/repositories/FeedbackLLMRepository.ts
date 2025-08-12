import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { Feedback } from '../entities/Feedback';

export interface FeedbackLLMRepository {
  generateFeedback(requestFeedbackDto: RequestFeedbackDto): Promise<Feedback>;
}
