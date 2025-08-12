import { NextRequest, NextResponse } from 'next/server';
import { GenerateFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GenerateFeedbackUsecase';
import { GPTFeedbackRepositoryImpl } from '@/backend/infrastructure/AI/openAI/GPTFeedbackRepositoryImpl';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { DeliverFeedbackDto } from '@/backend/application/feedbacks/dtos/DeliverFeedbackDto';
import { FeedbackRepositoryImpl } from '@/backend/infrastructure/repositories/FeedbackRepositoryImpl';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questions_report_id = searchParams.get('questions_report_id');

    console.log('questions_report_id', questions_report_id);

    if (!questions_report_id) {
      return NextResponse.json(
        { error: 'questions_report_id query parameters are required' },
        { status: 400 }
      );
    }

    const reportId = parseInt(questions_report_id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: 'questions_report_id must be valid numbers' },
        { status: 400 }
      );
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
      instructions:
        'Return a JSON object: {"score": number 0-100, "strength": [string, string], "improvement": [string, string]}. Use Korean for text fields. Consider both sampleAnswer and userAnswer when evaluating.',
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
