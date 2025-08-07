import { NextRequest, NextResponse } from 'next/server';
import { GenerateFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GenerateFeedbackUsecase';
import { GenerateFeedbackService } from '@/backend/infrastructure/repositories/GenerateFeedbackService';
import { GenerateFeedbackDto } from '@/backend/application/feedbacks/dtos/GenerateFeedbackDto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json({ error: 'reportId query parameter is required' }, { status: 400 });
    }

    const reportIdNumber = parseInt(reportId, 10);
    if (isNaN(reportIdNumber)) {
      return NextResponse.json({ error: 'reportId must be a valid number' }, { status: 400 });
    }

    const feedbackService = new GenerateFeedbackService();
    const generateFeedbackUsecase = new GenerateFeedbackUsecase(feedbackService);

    // Create input DTO
    const inputDto = new GenerateFeedbackDto(reportIdNumber);

    // Execute usecase
    const feedback = await generateFeedbackUsecase.execute(inputDto);

    // Create output DTO
    const outputDto = {
      reportId: feedback.reportId,
      score: feedback.score,
    };

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
