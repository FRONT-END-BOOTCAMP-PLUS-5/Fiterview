import { NextRequest, NextResponse } from 'next/server';
import { GenerateFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GenerateFeedbackUsecase';
import { GPTFeedbackRepositoryImpl } from '@/backend/infrastructure/AI/openAI/GPTFeedbackRepositoryImpl';
import { GetFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GetFeedbackUsecase';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { DeliverFeedbackDto } from '@/backend/application/feedbacks/dtos/DeliverFeedbackDto';
import { FeedbackRepositoryImpl } from '@/backend/infrastructure/repositories/FeedbackRepositoryImpl';
import { FEEDBACK_GENERATION_INSTRUCTIONS } from '@/constants/feedback';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = parseInt(params.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    const feedbackRepository = new FeedbackRepositoryImpl();
    const getFeedbackUsecase = new GetFeedbackUsecase(feedbackRepository);

    try {
      const feedback = await getFeedbackUsecase.execute(reportId);

      const outputDto: DeliverFeedbackDto = {
        feedback_report_id: feedback.feedback_report_id,
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = parseInt(params.id, 10);

    console.log('questions_report_id', reportId);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Fetch questions and answers from the database
    const persistenceRepository = new FeedbackRepositoryImpl();
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
    const usecase = new GenerateFeedbackUsecase(llmRepo, persistenceRepository);
    const feedback = await usecase.execute(dto);

    const outputDto: DeliverFeedbackDto = {
      feedback_report_id: feedback.feedback_report_id,
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
