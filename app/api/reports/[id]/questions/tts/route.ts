import { GenerateQuestionsTTSUsecase } from '@/backend/application/questions/usecases/GenerateQuestionsTTSUsecase';
import { GoogleCloudTtsAI } from '@/backend/infrastructure/AI/GoogleCloudTtsAI';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';
import { getUserFromSession } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';
import { GetReportByIdUsecase } from '@/backend/application/reports/usecases/GetReportByIdUsecase';
import { ReportRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    const userId = Number(user.id);
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

    // 리포트 소유권 확인
    const reportUsecase = new GetReportByIdUsecase(new ReportRepositoryImpl());
    const report = await reportUsecase.execute(reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, message: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (report.userId !== userId) {
      return NextResponse.json(
        { success: false, message: '이 리포트에 대한 권한이 없습니다.' },
        { status: 403 }
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
