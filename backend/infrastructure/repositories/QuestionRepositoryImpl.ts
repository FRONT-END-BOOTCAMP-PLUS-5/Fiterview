import { Question } from '../../domain/entities/Question';
import { QuestionRepository } from '../../domain/repositories/QuestionRepository';
import prisma from '../../../utils/prisma';

export class PrismaQuestionRepository implements QuestionRepository {
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
          id: 'asc',
        },
        take: 10, // 최대 10개 질문 조회
      });

      return questions.map((q) => ({
        id: q.id,
        order: q.order || undefined,
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
}
