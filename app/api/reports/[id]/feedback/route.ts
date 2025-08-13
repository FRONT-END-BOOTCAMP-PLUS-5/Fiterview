import { NextRequest, NextResponse } from 'next/server';
import { GenerateFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GenerateFeedbackUsecase';
import { GetFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GetFeedbackUsecase';
import { GPTFeedbackRepositoryImpl } from '@/backend/infrastructure/repositories/GPTFeedbackRepositoryImpl';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { DeliverFeedbackDto } from '@/backend/application/feedbacks/dtos/DeliverFeedbackDto';
import { FeedbackRepositoryImpl } from '@/backend/infrastructure/repositories/FeedbackRepositoryImpl';
import { FEEDBACK_GENERATION_INSTRUCTIONS } from '@/constants/feedback';
import { ReportRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
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
    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Fetch questions and answers from the database
    const persistenceRepository = new FeedbackRepositoryImpl();
    const reportRepository = new ReportRepositoryImpl();
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

    const llmRepo = new GPTFeedbackRepositoryImpl(dto);
    const usecase = new GenerateFeedbackUsecase(llmRepo, persistenceRepository, reportRepository);
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
