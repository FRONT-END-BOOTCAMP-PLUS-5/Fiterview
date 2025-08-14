import { GenerateQuestionsTTSUsecase } from '@/backend/application/questions/usecases/GenerateQuestionsTTSUsecase';
import { GoogleCloudTtsAI } from '@/backend/infrastructure/AI/GoogleCloudTtsAI';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const reportId = parseInt((await params).id);

    if (isNaN(reportId)) {
      return Response.json(
        {
          success: false,
          error: '유효하지 않은 리포트 ID입니다.',
        },
        { status: 400 }
      );
    }

    const useCase = new GenerateQuestionsTTSUsecase(
      new QuestionRepositoryImpl(),
      new GoogleCloudTtsAI()
    );

    const questionsWithTTS: QuestionTTSResponse[] = await useCase.execute(reportId);

    return Response.json({
      success: true,
      data: questionsWithTTS,
      reportId: reportId,
    });
  } catch (error) {
    console.error('질문 TTS 생성 API 오류:', error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        reportId: (await params).id,
      },
      { status: 500 }
    );
  }
}
