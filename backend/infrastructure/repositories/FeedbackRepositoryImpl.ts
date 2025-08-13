import prisma from '@/utils/prisma';
import { FeedbackRepository } from '@/backend/domain/repositories/FeedbackRepository';
import { Feedback } from '@/backend/domain/entities/Feedback';
import { Question } from '@/backend/domain/entities/Question';

export class FeedbackRepositoryImpl implements FeedbackRepository {
  async getFeedback(feedback_report_id: number): Promise<Feedback> {
    const feedback = await prisma.feedback.findUnique({
      where: { reportId: feedback_report_id },
      select: { reportId: true, score: true, strength: true, improvement: true },
    });
    if (!feedback) {
      throw new Error(`Feedback not found for report ${feedback_report_id}`);
    }
    let strengthArray: string[] = [];
    let improvementArray: string[] = [];
    try {
      strengthArray = JSON.parse(feedback.strength);
      if (!Array.isArray(strengthArray)) strengthArray = [];
    } catch {
      strengthArray = feedback.strength
        ? feedback.strength.split(/(?<=[.!?])\s+|\n+/).filter(Boolean)
        : [];
    }
    try {
      improvementArray = JSON.parse(feedback.improvement);
      if (!Array.isArray(improvementArray)) improvementArray = [];
    } catch {
      improvementArray = feedback.improvement
        ? feedback.improvement.split(/(?<=[.!?])\s+|\n+/).filter(Boolean)
        : [];
    }
    return {
      feedback_report_id: feedback.reportId,
      score: feedback.score,
      strength: strengthArray,
      improvement: improvementArray,
    };
  }

  async saveFeedback(feedback: Feedback): Promise<void> {
    await prisma.feedback.upsert({
      where: { reportId: feedback.feedback_report_id },
      create: {
        reportId: feedback.feedback_report_id,
        score: feedback.score,
        strength: JSON.stringify(feedback.strength ?? []),
        improvement: JSON.stringify(feedback.improvement ?? []),
      },
      update: {
        score: feedback.score,
        strength: JSON.stringify(feedback.strength ?? []),
        improvement: JSON.stringify(feedback.improvement ?? []),
      },
    });
  }

  async getQuestionsAndAnswers(
    reportId: number
  ): Promise<Pick<Question, 'question' | 'sampleAnswer' | 'userAnswer'>[]> {
    const rows = await prisma.question.findMany({
      where: { reportId },
      select: { question: true, sampleAnswer: true, userAnswer: true },
      take: 10,
    });

    return rows.map((r) => ({
      question: r.question,
      sampleAnswer: r.sampleAnswer ?? undefined,
      userAnswer: r.userAnswer ?? undefined,
    }));
  }
}
