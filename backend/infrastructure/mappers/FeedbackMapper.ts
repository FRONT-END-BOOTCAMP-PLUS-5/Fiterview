import { Feedback } from '@/backend/domain/entities/Feedback';

export const toFeedback = (
  feedback_report_id: number,
  score: number,
  strength: string[],
  improvement: string[]
): Feedback => {
  return { feedback_report_id, score, strength, improvement };
};
