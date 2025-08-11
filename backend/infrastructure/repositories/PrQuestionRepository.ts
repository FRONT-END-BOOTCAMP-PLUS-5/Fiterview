import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';
import { Question } from '@/backend/domain/entities/Question';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionGenerator } from '@/backend/infrastructure/repositories/GenerateQuestionRepositoryImpl';
import prisma from '@/utils/prisma';

export class PrismaQuestionRepository implements QuestionRepository {
  private generator: QuestionGenerator;

  constructor() {
    this.generator = new QuestionGenerator();
  }

  // questions테이블의 질문만 조회(TTS 요청 시 사용)
  async getQuestionsByReportId(reportId: number): Promise<Question[]> {
    try {
      const questions = await prisma.question.findMany({
        where: {
          reportId: reportId,
        },
        select: {
          id: true,
          order: true,
          question: true,
          sampleAnswer: true,
          userAnswer: true,
          recording: true,
          reportId: true,
        },
        orderBy: {
          order: 'asc',
        },
        take: 10, // 최대 10개 질문 조회
      });

      return questions.map((q) => ({
        id: q.id,
        order: q.order || 0,
        question: q.question,
        sampleAnswer: q.sampleAnswer || undefined,
        userAnswer: q.userAnswer || undefined,
        recording: q.recording || undefined,
        reportId: q.reportId,
      }));
    } catch (error) {
      console.error('질문 조회 중 오류 발생:', error);
      throw new Error(
        `질문 조회에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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

    const saved = await prisma.$transaction(
      sortedQuestions.map((gen) =>
        prisma.question.create({
          data: {
            question: gen.question,
            order: gen.order,
            reportId,
          },
        })
      )
    );

    // 저장 결과에 정렬된 order를 매칭하여 반환
    return saved.map((q, idx) => ({
      id: q.id,
      order: (q as any).order ?? sortedQuestions[idx].order,
      question: q.question,
      sampleAnswer: q.sampleAnswer || undefined,
      userAnswer: q.userAnswer || undefined,
      recording: q.recording || undefined,
      reportId: q.reportId,
    }));
  }
}
