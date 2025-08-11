import { Feedback } from '../entities/feedback';
import { GenerateFeedbackDto } from '@/backend/application/evaluations/dtos/GenerateFeedbackDto';

export interface IFeedbackRepository {
  generateResponse(dto: GenerateFeedbackDto): Promise<Feedback>;
}
