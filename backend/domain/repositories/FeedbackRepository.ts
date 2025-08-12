import { Feedback } from '../entities/Feedback';

export interface FeedbackRepository {
  getFeedback(feedback_report_id: number): Promise<Feedback>;
  saveFeedback(feedback: Feedback): Promise<void>;
  getQuestionsAndAnswers(
    reportId: number
  ): Promise<{ question: string; sampleAnswer?: string | null; userAnswer?: string | null }[]>;
}
