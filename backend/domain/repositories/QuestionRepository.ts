import { Question } from '@/backend/domain/entities/Question';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
export interface QuestionRepository {
  // questions테이블의 질문만 조회(TTS 요청 시 사용)
  getQuestionsByReportId(reportId: number): Promise<Question[]>;

  // questions테이블의 사용자 답변만 조회(STT 요청 시 사용)
  // 사용자 답변 수정
  // getUserAnswer():
  // updateUserAnswer():
  // 질문 생성
  generateQuestions(files: QuestionsRequest[]): Promise<QuestionsResponse[]>;
  // 생성된 질문 -> DB에 저장
  saveQuestions(generatedQuestions: QuestionsResponse[], reportId: number): Promise<Question[]>;
}
