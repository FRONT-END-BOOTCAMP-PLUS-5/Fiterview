import { NextRequest, NextResponse } from 'next/server';
import { ReportRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';
import { UpdateReportUsecase } from '@/backend/application/reports/usecases/UpdateReportUsecase';
import { DeleteReportUsecase } from '@/backend/application/reports/usecases/DeleteReportUsecase';
import { GetReportByIdUsecase } from '@/backend/application/reports/usecases/GetReportByIdUsecase';
import { GetQuestionsUsecase } from '@/backend/application/questions/usecases/GetQuestionsUsecase';
import { ReportDto } from '@/backend/application/reports/dtos/ReportDto';
import { QuestionDto } from '@/backend/application/questions/dtos/QuestionDto';
import { getUserFromSession } from '@/lib/auth/api-auth';

const reportsRepository = new ReportRepositoryImpl();
const questionRepository = new QuestionRepositoryImpl();
const updateReportUsecase = new UpdateReportUsecase(reportsRepository);
const deleteReportUsecase = new DeleteReportUsecase(reportsRepository);
const getReportByIdUsecase = new GetReportByIdUsecase(reportsRepository);
const getQuestionsUsecase = new GetQuestionsUsecase(questionRepository);

//수정 (제목, 회고)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);
    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID입니다.' },
        { status: 400 }
      );
    }

    // 리포트 소유권 확인
    const existingReport = await getReportByIdUsecase.execute(reportId);
    if (!existingReport) {
      return NextResponse.json(
        { success: false, message: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingReport.userId !== userId) {
      return NextResponse.json(
        { success: false, message: '이 리포트에 대한 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, reflection, status } = body as {
      title?: string;
      reflection?: string;
      status?: 'PENDING' | 'ANALYZING' | 'COMPLETED';
    };

    const updateData: {
      title?: string;
      reflection?: string;
      status?: 'PENDING' | 'ANALYZING' | 'COMPLETED';
    } = {};
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
    const data: ReportDto = {
      id: updatedReport.id,
      title: updatedReport.title,
      createdAt: updatedReport.createdAt.toISOString(),
      status: updatedReport.status,
      userId: updatedReport.userId,
      reflection: updatedReport.reflection,
    };

    return NextResponse.json({
      success: true,
      data,
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
    console.log('🔍 GET /api/reports/[id] 호출됨');
    console.log('📡 요청 헤더:', Object.fromEntries(request.headers.entries()));

    // 사용자 인증 확인
    const user = await getUserFromSession();
    console.log('👤 getUserFromSession 결과:', user);

    if (!user) {
      console.log('❌ 인증 실패: 사용자 정보 없음');
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);
    console.log('🆔 인증된 사용자 ID:', userId);

    const { id } = await params;
    const reportId = parseInt(id, 10);
    console.log('📋 요청된 리포트 ID:', reportId);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID입니다.' },
        { status: 400 }
      );
    }

    const report = await getReportByIdUsecase.execute(reportId);
    console.log('📄 조회된 리포트:', report);

    if (!report) {
      console.log('❌ 리포트 없음');
      return NextResponse.json(
        { success: false, message: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 리포트 소유권 확인
    console.log('🔐 소유권 확인:', { reportUserId: report.userId, requestUserId: userId });
    if (report.userId !== userId) {
      console.log('❌ 권한 없음: 다른 사용자의 리포트');
      return NextResponse.json(
        { success: false, message: '이 리포트에 대한 권한이 없습니다.' },
        { status: 403 }
      );
    }

    console.log('✅ 권한 확인 통과');

    // 해당 리포트의 질문들도 함께 조회
    const questions = await getQuestionsUsecase.execute(reportId);

    const questionDtos: QuestionDto[] = questions.map((q) => ({
      id: q.id,
      order: q.order,
      question: q.question,
      sampleAnswer: q.sampleAnswer,
      userAnswer: q.userAnswer,
      recording: q.recording,
    }));

    const data = {
      id: report.id,
      title: report.title,
      createdAt: report.createdAt.toISOString(),
      status: report.status,
      userId: report.userId,
      reflection: report.reflection,
      questions: questionDtos,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
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
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);
    const { id } = await params;
    const reportId = parseInt(id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID입니다.' },
        { status: 400 }
      );
    }

    // 리포트 소유권 확인
    const existingReport = await getReportByIdUsecase.execute(reportId);
    if (!existingReport) {
      return NextResponse.json(
        { success: false, message: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingReport.userId !== userId) {
      return NextResponse.json(
        { success: false, message: '이 리포트에 대한 권한이 없습니다.' },
        { status: 403 }
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
