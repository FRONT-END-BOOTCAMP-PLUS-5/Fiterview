import { NextRequest, NextResponse } from 'next/server';
import { PrReportsRepository } from '../../../backend/reports/infrastructure/repositories/PrReportsRepository';
import { CreateReportUsecase } from '@/backend/application/reports/usecases/CreateReportUsecase';
import { GetReportsUsecase } from '@/backend/application/reports/usecases/GetReportsUsecase';

const reportsRepository = new PrReportsRepository();
const createReportUsecase = new CreateReportUsecase(reportsRepository);
const getReportsUsecase = new GetReportsUsecase(reportsRepository);

export async function GET() {
  try {
    const reports = await getReportsUsecase.execute();

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('리포트 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const createdReport = await createReportUsecase.execute(userId);

    return NextResponse.json(
      {
        success: true,
        data: createdReport,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('리포트 생성 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
