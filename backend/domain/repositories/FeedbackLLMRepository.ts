import { RequestFeedbackDto } from '@/backend/application/feedback/dtos/RequestFeedbackDto';
import { Feedback } from '../entities/Feedback';

export interface FeedbackLLMRepository {
  generateFeedback(requestFeedbackDto: RequestFeedbackDto): Promise<Feedback>;
}
