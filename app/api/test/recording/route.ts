// app/api/test/recording/route.ts
import { NextResponse } from 'next/server';
import { GenerateRecordingUsecase } from '@/backend/application/questions/usecases/GenerateRecordingUsecase';
// 의존성 주입을 위한 Repository 가져오기 (실제 DB 연결된 것)
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const reportId = Number(formData.get('reportId'));
    const order = Number(formData.get('order'));

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Repository 인스턴스 생성 (프로젝트 구조에 맞게 수정)
    const repository = new QuestionRepositoryImpl();
    const usecase = new GenerateRecordingUsecase(repository);

    const result = await usecase.execute({
      reportId,
      order,
      audioBuffer: buffer,
      contentType: audioFile.type,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
