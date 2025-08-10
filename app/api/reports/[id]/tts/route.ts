import { GenerateQuestionsTTSUsecase } from '@/backend/application/questions/usecases/GenerateQuestionsTTSUsecase';
import { PrismaQuestionRepository } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';
import { PrTTSRepository } from '@/backend/infrastructure/repositories/TTSRepositoryImpl';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
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
      new PrismaQuestionRepository(),
      new PrTTSRepository()
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
        reportId: params.id,
      },
      { status: 500 }
    );
  }
}
