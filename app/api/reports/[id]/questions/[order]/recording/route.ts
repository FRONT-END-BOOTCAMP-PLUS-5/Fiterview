import { NextRequest, NextResponse } from 'next/server';
import { GenerateRecordingUsecase } from '@/backend/application/questions/usecases/GenerateRecordingUsecase';
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; order: string }> }
) {
  try {
    const { id, order: orderParam } = await params;

    const reportId = parseInt(id, 10);
    if (Number.isNaN(reportId) || reportId < 1) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 reportId입니다.' },
        { status: 400 }
      );
    }

    const order = parseInt(orderParam, 10);
    if (Number.isNaN(order) || order < 1 || order > 10) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 order 입니다.', validRange: '1-10' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'audio 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // 의존성 주입: 레포지토리를 유스케이스에 주입
    const questionRepository = new QuestionRepositoryImpl();
    const usecase = new GenerateRecordingUsecase(questionRepository);

    const result = await usecase.execute({
      reportId,
      order,
      audioBuffer,
      contentType: audioFile.type,
    });

    return NextResponse.json({ success: true, fileName: result.filePath });
  } catch (error) {
    console.error('녹음본 저장 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
