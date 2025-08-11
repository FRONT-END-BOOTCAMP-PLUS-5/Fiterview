import prisma from '@/utils/prisma';
import { IFeedbackRepository } from '@/backend/domain/repositories/IFeedbackRepository';
import { Feedback } from '@/backend/domain/entities/Feedback';

export class PrFeedbackRepository implements IFeedbackRepository {
  async getFeedback(feedback_report_id: number): Promise<Feedback> {
    const feedback = await prisma.feedback.findUnique({
      where: { reportId: feedback_report_id },
      select: { reportId: true, score: true, strength: true, improvement: true },
    });
    if (!feedback) {
      throw new Error(`Feedback not found for report ${feedback_report_id}`);
    }
    return {
      feedback_report_id: feedback.reportId,
      score: feedback.score,
      strength: feedback.strength,
      improvement: feedback.improvement,
    };
  }

  async saveFeedback(feedback: Feedback): Promise<void> {
    await prisma.feedback.upsert({
      where: { reportId: feedback.feedback_report_id },
      create: {
        reportId: feedback.feedback_report_id,
        score: feedback.score,
        strength: feedback.strength,
        improvement: feedback.improvement,
      },
      update: {
        score: feedback.score,
        strength: feedback.strength,
        improvement: feedback.improvement,
      },
    });
  }

  async getQuestionsAndAnswers(reportId: number): Promise<
    {
      question: string;
      sampleAnswer?: string | null;
      userAnswer?: string | null;
    }[]
  > {
    const rows = await prisma.question.findMany({
      where: { reportId },
      select: { question: true, sampleAnswer: true, userAnswer: true },
      take: 10,
    });
    return rows.map((r) => ({
      question: r.question,
      sampleAnswer: r.sampleAnswer,
      userAnswer: r.userAnswer,
    }));
  }
}
