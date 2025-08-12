import { QuestionsRequest } from '../../dtos/QuestionsRequest';
import { QuestionsResponse } from '../../dtos/QuestionsResponse';

export interface GenerateQuestionRepository {
  // 질문 생성
  generateQuestions(files: QuestionsRequest[]): Promise<QuestionsResponse[]>;
}
