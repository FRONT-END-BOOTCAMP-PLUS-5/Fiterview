import { QuestionsRequest } from '../../dtos/QuestionsRequest';
import { QuestionsResponse } from '../../dtos/QuestionsResponse';
import { Question } from '../../entities/Question';

export interface GenerateQuestionRepository {
  // 질문 생성
  generateQuestions(files: QuestionsRequest[]): Promise<QuestionsResponse[]>;
  // 생성된 질문 -> DB에 저장
  saveQuestions(generatedQuestions: QuestionsResponse[], reportId: number): Promise<Question[]>;
}
