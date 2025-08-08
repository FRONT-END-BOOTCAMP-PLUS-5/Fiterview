import { Question } from '@/backend/domain/entities/Question';

// 생성된 질문 (AI로부터)
export interface GeneratedQuestion {
  number: number;
  question: string;
}

// 질문 생성을 위한 파일
export interface QuestionFile {
  buffer: Buffer;
  fileName: string;
}

// AI 질문 생성 결과
export interface QuestionGenerationResult {
  questions: GeneratedQuestion[];
}

// 질문들을 DB에 저장한 결과
export interface QuestionCreationResult {
  questions: Question[];
  reportId: number;
}
