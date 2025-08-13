import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { Question } from '@/backend/domain/entities/Question';

export interface LlmAI {
  // 질문 생성
  generateQuestions(files: QuestionsRequest[]): Promise<QuestionsResponse[]>;
  // 생성된 질문 -> DB에 저장
  saveQuestions(generatedQuestions: QuestionsResponse[], reportId: number): Promise<Question[]>;
}
