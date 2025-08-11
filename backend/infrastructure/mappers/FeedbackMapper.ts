import { Feedback } from '@/backend/domain/entities/feedback';

export class FeedbackMapper {
  static toFeedback(
    feedback_report_id: number,
    score: string,
    strength: string,
    improvement: string
  ): Feedback {
    return new Feedback(feedback_report_id, score, strength, improvement);
  }
}
