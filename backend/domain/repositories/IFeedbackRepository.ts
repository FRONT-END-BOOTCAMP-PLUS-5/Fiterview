import { Feedback } from '../entities/feedback';

export interface IFeedbackRepository {
  generateFeedback(reportId: number): Promise<Feedback>;
}
