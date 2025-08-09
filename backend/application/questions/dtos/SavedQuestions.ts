import { Question } from '@/backend/domain/entities/Question';

export interface SavedQuestionsResult {
  questions: Question[];
  reportId: number;
}
