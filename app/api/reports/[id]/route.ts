import { NextRequest, NextResponse } from 'next/server';
import { ReportsRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';
import { UpdateReportUsecase } from '@/backend/application/reports/usecases/UpdateReportUsecase';
import { DeleteReportUsecase } from '@/backend/application/reports/usecases/DeleteReportUsecase';

const reportsRepository = new ReportsRepositoryImpl();
const updateReportUsecase = new UpdateReportUsecase(reportsRepository);
const deleteReportUsecase = new DeleteReportUsecase(reportsRepository);

//수정 (제목, 회고)
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

//조회
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

//삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID입니다.' },
        { status: 400 }
      );
    }

    await deleteReportUsecase.execute(reportId);

    return NextResponse.json({
      success: true,
      message: '리포트가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('리포트 삭제 오류:', error);

    if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
