import { Question } from '@/backend/domain/entities/Question';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
export interface QuestionRepository {
  // questions테이블의 질문만 조회(TTS 요청 시 사용)
  getQuestionsByReportId(reportId: number): Promise<Question[]>;
  // questions테이블 조회(report 조회 시 사용)
  findAllByReportId(reportId: number): Promise<Question[]>;

  // questions테이블의 사용자 답변만 조회(STT 요청 시 사용)
  // 사용자 답변 수정
  // getUserAnswer():
  // updateUserAnswer():
}
