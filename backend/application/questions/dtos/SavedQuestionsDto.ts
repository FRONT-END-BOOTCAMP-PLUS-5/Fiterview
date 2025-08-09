import { Question } from '@/backend/domain/entities/Question';

export interface SavedQuestionsDto {
  questions: Question[];
  reportId: number;
}
