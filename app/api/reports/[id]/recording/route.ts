import { GenerateRecordingUsecase } from '@/backend/application/questions/usecases/GenerateRecordingUsecase';
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const reportId = parseInt((await params).id, 10);
    if (Number.isNaN(reportId)) {
      return Response.json(
        { success: false, error: '유효하지 않은 reportId입니다.' },
        { status: 400 }
      );
    }
    const url = new URL(request.url);
    const orderRaw = url.searchParams.get('order');
    if (!orderRaw) {
      return Response.json('order 쿼리스트링이 필요합니다.');
    }
    const order = parseInt(orderRaw, 10);
    if (Number.isNaN(order)) {
      return Response.json('유효하지 않은 order 입니다.');
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return Response.json(
        { success: false, error: 'audio와 order가 필요합니다.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const usecase = new GenerateRecordingUsecase(new QuestionRepositoryImpl());
    const result = await usecase.execute({
      reportId,
      order,
      audioBuffer,
      contentType: audioFile.type,
    });

    return Response.json(result);
  } catch (error) {
    console.error('녹음본 저장 API 오류:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
