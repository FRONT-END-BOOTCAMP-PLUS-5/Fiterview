import { NextRequest, NextResponse } from 'next/server';
import { PrReportsRepository } from '@/backend/infrastructure/repositories/PrReportsRepository';
import { UpdateReportUsecase } from '@/backend/application/reports/usecases/UpdateReportUsecase';

const reportsRepository = new PrReportsRepository();
const updateReportUsecase = new UpdateReportUsecase(reportsRepository);

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, reflection, status } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (reflection !== undefined) updateData.reflection = reflection;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: '업데이트할 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    const updatedReport = await updateReportUsecase.execute(reportId, updateData);

    return NextResponse.json({
      success: true,
      data: updatedReport,
    });
  } catch (error) {
    console.error('리포트 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID입니다.' },
        { status: 400 }
      );
    }

    const report = await reportsRepository.findReportById(reportId);

    if (!report) {
      return NextResponse.json(
        { success: false, message: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('리포트 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
