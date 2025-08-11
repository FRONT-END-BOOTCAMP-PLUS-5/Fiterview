import { Feedback } from '@/backend/domain/entities/Feedback';

export class FeedbackMapper {
  static toFeedback(
    feedback_report_id: number,
    score: number,
    strength: string,
    improvement: string
  ): Feedback {
    return { feedback_report_id, score, strength, improvement };
  }
}
