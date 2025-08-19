import { NextRequest, NextResponse } from 'next/server';
import { GenerateFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GenerateFeedbackUsecase';
import { GetFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GetFeedbackUsecase';
import { UpdateReportStatusUsecase } from '@/backend/application/reports/usecases/UpdateReportStatusUsecase';
import { Gpt4oLlmAI } from '@/backend/infrastructure/AI/Gpt4oLlmAI';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { DeliverFeedbackDto } from '@/backend/application/feedbacks/dtos/DeliverFeedbackDto';
import { FeedbackRepositoryImpl } from '@/backend/infrastructure/repositories/FeedbackRepositoryImpl';
import { FEEDBACK_GENERATION_INSTRUCTIONS } from '@/constants/feedback';
import { ReportRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';
import { getUserFromSession } from '@/lib/auth/api-auth';
import { GetReportByIdUsecase } from '@/backend/application/reports/usecases/GetReportByIdUsecase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // 리포트 소유권 확인
    const reportRepository = new ReportRepositoryImpl();
    const getReportByIdUsecase = new GetReportByIdUsecase(reportRepository);
    const existingReport = await getReportByIdUsecase.execute(reportId);
    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    if (existingReport.userId !== Number(user.id)) {
      return NextResponse.json({ error: '이 리포트에 대한 권한이 없습니다.' }, { status: 403 });
    }

    const feedbackRepository = new FeedbackRepositoryImpl();
    const getFeedbackUsecase = new GetFeedbackUsecase(feedbackRepository);

    try {
      const feedback = await getFeedbackUsecase.execute(reportId);

      const outputDto: DeliverFeedbackDto = {
        reportId: feedback.feedback_report_id,
        score: feedback.score,
        strength: feedback.strength,
        improvement: feedback.improvement,
      };

      return NextResponse.json(outputDto, { status: 200 });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ error: 'Feedback not found for this report' }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting feedback:', error);
    return NextResponse.json({ error: 'Failed to get feedback' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Fetch questions and answers from the database
    const persistenceRepository = new FeedbackRepositoryImpl();
    const reportRepository = new ReportRepositoryImpl();

    // 리포트 소유권 확인
    const getReportByIdUsecase = new GetReportByIdUsecase(reportRepository);
    const existingReport = await getReportByIdUsecase.execute(reportId);
    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    if (existingReport.userId !== Number(user.id)) {
      return NextResponse.json({ error: '이 리포트에 대한 권한이 없습니다.' }, { status: 403 });
    }
    const questionsAndAnswers = await persistenceRepository.getQuestionsAndAnswers(reportId);

    if (questionsAndAnswers.length === 0) {
      return NextResponse.json(
        { error: 'No questions with answers found for this report' },
        { status: 404 }
      );
    }

    const dto: RequestFeedbackDto = {
      reportId,
      pairs: questionsAndAnswers,
      model: 'gpt-4o',
      instructions: FEEDBACK_GENERATION_INSTRUCTIONS,
      maxOutputTokens: 1000,
    };

    const llmRepo = new Gpt4oLlmAI();
    const updateReportStatusUsecase = new UpdateReportStatusUsecase(reportRepository);
    const usecase = new GenerateFeedbackUsecase(
      llmRepo,
      persistenceRepository,
      updateReportStatusUsecase
    );
    const feedback = await usecase.execute(dto);

    const outputDto: DeliverFeedbackDto = {
      reportId: feedback.feedback_report_id,
      score: feedback.score,
      strength: feedback.strength,
      improvement: feedback.improvement,
    };

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
