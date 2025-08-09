import { NextRequest, NextResponse } from 'next/server';
import { CreateReportUsecase } from '@/backend/application/reports/usecases/CreateReportUsecase';
import { PrReportsRepository } from '@/backend/infrastructure/repositories/PrReportRepository';
import { PrismaQuestionRepository } from '@/backend/infrastructure/repositories/PrQuestionRepository';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userIdStr = formData.get('userId') as string;
    const userId = parseInt(userIdStr || '0', 10);

    //로그인 유저 확인
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }
    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: '파일이 필요합니다.' }, { status: 400 });
    }

    // 파일 확인
    const questionFiles = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
      }))
    );

    const useCase = new CreateReportUsecase(
      new PrReportsRepository(),
      new PrismaQuestionRepository()
    );

    const result = await useCase.execute({ userId, files: questionFiles });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('리포트 생성 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
