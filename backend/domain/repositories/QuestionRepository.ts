import { Question, AudioFileInfo } from '@/backend/domain/entities/Question';

export interface QuestionRepository {
  // questions테이블의 질문만 조회(TTS 요청 시 사용)
  getQuestionsByReportId(reportId: number): Promise<Question[]>;
  // questions테이블 조회(report 조회 시 사용)
  findAllByReportId(reportId: number): Promise<Question[]>;

  // audio 관련 메서드
  getAudioFileByQuestion(reportId: number, questionOrder: number): Promise<AudioFileInfo>;
}
