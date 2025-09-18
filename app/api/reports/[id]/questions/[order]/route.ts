import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/api-auth';
import { ReportRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';
import { GetReportByIdUsecase } from '@/backend/application/reports/usecases/GetReportByIdUsecase';
import { UpdateReportOrderUsecase } from '@/backend/application/reports/usecases/UpdateReportOrderUsecase';

const reportsRepository = new ReportRepositoryImpl();
const getReportByIdUsecase = new GetReportByIdUsecase(reportsRepository);
const updateReportOrderUsecase = new UpdateReportOrderUsecase(reportsRepository);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; order: string }> }
) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);
    const { id, order } = await params;
    const reportId = parseInt(id, 10);
    const currentOrder = parseInt(order, 10);

    if (isNaN(reportId) || isNaN(currentOrder)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID 또는 질문 순서입니다.' },
        { status: 400 }
      );
    }

    const report = await getReportByIdUsecase.execute(reportId);
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

    await updateReportOrderUsecase.execute(reportId, currentOrder);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('currentOrder 업데이트 오류:', error);

    if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
