import {
  Question,
  QuestionFile,
  QuestionGenerationResult,
  QuestionCreationResult,
  GeneratedQuestion,
} from '../entities/Question';

export interface QuestionRepository {
  // AI로 질문 생성
  generateQuestions(files: QuestionFile[]): Promise<QuestionGenerationResult>;

  // 생성된 질문들을 DB에 저장
  saveQuestions(
    generatedQuestions: GeneratedQuestion[],
    reportId: number
  ): Promise<QuestionCreationResult>;
}
