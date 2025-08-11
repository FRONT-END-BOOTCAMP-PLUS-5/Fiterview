import { NextRequest, NextResponse } from 'next/server';
import { GenerateFeedbackUsecase } from '@/backend/application/evaluations/usecases/GenerateFeedbackUsecase';
import { GPTFeedbackRepository } from '@/backend/infrastructure/repositories/GPTFeedbackRepositoryImpl';
import { GenerateFeedbackDto } from '@/backend/application/evaluations/dtos/GenerateFeedbackDto';
import { DeliverFeedbackDto } from '@/backend/application/evaluations/dtos/DeliverFeedbackDto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questions_report_id = searchParams.get('questions_report_id');
    const answers_report_id = searchParams.get('answers_report_id');

    console.log('questions_report_id', questions_report_id);
    console.log('answers_report_id', answers_report_id);

    if (!questions_report_id || !answers_report_id) {
      return NextResponse.json(
        { error: 'questions_report_id and answers_report_id query parameters are required' },
        { status: 400 }
      );
    }

    const questions_report_idNumber = parseInt(questions_report_id, 10);
    const answers_report_idNumber = parseInt(answers_report_id, 10);
    if (isNaN(questions_report_idNumber) || isNaN(answers_report_idNumber)) {
      return NextResponse.json(
        { error: 'questions_report_id and answers_report_id must be valid numbers' },
        { status: 400 }
      );
    }

    const inputDto = new GenerateFeedbackDto(
      questions_report_idNumber,
      answers_report_idNumber,
      'gpt-4o',
      'Return a JSON object with a numeric "score" between 0 and 100, a "strength" and an "improvement" in Korean. Example: {"score": 85, "strength": "이 답변의 강점은...", "improvement": "이 답변의 개선 방법은..."}',
      '',
      1000
    );

    const feedbackService = new GPTFeedbackRepository(inputDto);
    const generateFeedbackUsecase = new GenerateFeedbackUsecase(feedbackService);
    const feedback = await generateFeedbackUsecase.execute(inputDto);

    const outputDto = new DeliverFeedbackDto(
      feedback.feedback_report_id,
      feedback.score,
      feedback.strength,
      feedback.improvement
    );

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
