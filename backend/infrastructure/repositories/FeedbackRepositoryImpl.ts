import prisma from '@/utils/prisma';
import { FeedbackRepository } from '@/backend/domain/repositories/FeedbackRepository';
import { Feedback } from '@/backend/domain/entities/Feedback';
import { ReportStatus } from '@prisma/client';

export class FeedbackRepositoryImpl implements FeedbackRepository {
  async getFeedback(feedback_report_id: number): Promise<Feedback> {
    const feedback = await prisma.feedback.findUnique({
      where: { reportId: feedback_report_id },
      select: { reportId: true, score: true, strength: true, improvement: true },
    });
    const reportStatus = await prisma.report.findUnique({
      where: { id: feedback_report_id },
      select: { status: true },
    });
    if (reportStatus?.status !== ReportStatus.COMPLETED) {
      throw new Error(`Report is not completed`);
    }
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
  ): Promise<{ question: string; sampleAnswer?: string | null; userAnswer?: string | null }[]> {
    const rows = await prisma.question.findMany({
      where: { reportId },
      select: { question: true, sampleAnswer: true, userAnswerClean: true },
      take: 10,
    });

    // LLM 평가는 후처리된 clean 텍스트를 사용한다.
    return rows.map((r) => ({
      question: r.question,
      sampleAnswer: r.sampleAnswer ?? undefined,
      userAnswer: r.userAnswerClean ?? undefined,
    }));
  }
}
