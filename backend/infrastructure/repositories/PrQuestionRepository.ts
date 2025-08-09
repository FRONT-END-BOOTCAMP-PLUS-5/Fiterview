import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';
import { PrismaClient } from '@prisma/client';
import { Question } from '@/backend/domain/entities/Question';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { GeminiQuestionGenerator } from '@/backend/infrastructure/repositories/GenerateQuestionRepositoryImpl';

export class PrismaQuestionRepository implements QuestionRepository {
  private prisma: PrismaClient;
  private generator: GeminiQuestionGenerator;

  constructor() {
    this.prisma = new PrismaClient();
    this.generator = new GeminiQuestionGenerator();
  }
  // 질문 생성
  async generateQuestions(files: QuestionsRequest[]) {
    return this.generator.generate(files);
  }
  // 질문 저장
  async saveQuestions(
    generatedQuestions: QuestionsResponse[],
    reportId: number
  ): Promise<Question[]> {
    //order순으로 정렬
    const sortedQuestions = [...generatedQuestions].sort((a, b) => a.order - b.order);

    const saved = await this.prisma.$transaction(
      sortedQuestions.map((gen) =>
        this.prisma.question.create({
          data: {
            question: gen.question,
            reportId,
          },
        })
      )
    );

    return saved.map((q) => ({
      id: q.id,
      question: q.question,
      sampleAnswer: q.sampleAnswer || undefined,
      userAnswer: q.userAnswer || undefined,
      recording: q.recording || undefined,
      reportId: q.reportId,
    }));
  }
}
