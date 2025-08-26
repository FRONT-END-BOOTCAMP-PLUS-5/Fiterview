import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { Question } from '@/backend/domain/entities/Question';
import { Feedback } from '@/backend/domain/entities/Feedback';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswersDto';

export interface LlmAI {
  // 질문 생성
  generateQuestions(files: QuestionsRequest[]): Promise<QuestionsResponse[]>;
  // 생성된 질문 -> DB에 저장
  saveQuestions(generatedQuestions: QuestionsResponse[], reportId: number): Promise<Question[]>;
}

export interface Gpt4oLlmAI {
  // 샘플 답변 생성
  generateSampleAnswer(GenerateSampleAnswersDto: GenerateSampleAnswersDto): Promise<string>;
  // 피드백 생성
  generateFeedback(requestFeedbackDto: RequestFeedbackDto): Promise<Feedback>;
}
