import { NextRequest, NextResponse } from 'next/server';
import { ReportRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';
import { GetUserReportsUsecase } from '@/backend/application/reports/usecases/GetUserReportsUsecase';
import { GetReportsByStatusUsecase } from '@/backend/application/reports/usecases/GetReportsByStatusUsecase';
import { DeleteReportUsecase } from '@/backend/application/reports/usecases/DeleteReportUsecase';
import { ReportDto } from '@/backend/application/reports/dtos/ReportDto';
import { getUserFromSession } from '@/lib/auth/api-auth';
import { createJob, linkReport, setJobStep } from '@/lib/server/progressStore';
import { CreateReportUsecase } from '@/backend/application/reports/usecases/CreateReportUsecase';

const reportsRepository = new ReportRepositoryImpl();
const questionRepository = new QuestionRepositoryImpl();
const getUserReportsUsecase = new GetUserReportsUsecase(reportsRepository);
const getReportsByStatusUsecase = new GetReportsByStatusUsecase(reportsRepository);
const deleteReportUsecase = new DeleteReportUsecase(reportsRepository);
const createReportUsecase = new CreateReportUsecase(reportsRepository, questionRepository);

//조회
export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);

    // status 검증
    const parseStatus = (value: string | null): ReportDto['status'] | undefined => {
      if (!value) return undefined;
      const upperValue = value.toUpperCase();
      if (['PENDING', 'ANALYZING', 'COMPLETED'].includes(upperValue)) {
        return upperValue as ReportDto['status'];
      }
      return undefined;
    };

    const { searchParams } = new URL(request.url);
    const status = parseStatus(searchParams.get('status'));

    let reports;
    if (status) {
      // status 리포트만 조회
      reports = await getReportsByStatusUsecase.execute(userId, status);
    } else {
      // 전체 리포트 조회
      reports = await getUserReportsUsecase.execute(userId);
    }
    const data: ReportDto[] = reports.map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: r.createdAt.toISOString(),
      status: r.status,
      userId: r.userId,
      reflection: r.reflection,
    }));

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

//생성
export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: '파일이 필요합니다.' }, { status: 400 });
    }

    const jobId = (globalThis as any).crypto?.randomUUID
      ? (globalThis as any).crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    createJob(jobId);

    // 응답은 즉시 반환하고, 나머지는 백그라운드에서 UseCase로 처리 (진행상태 기록)
    (async () => {
      try {
        setJobStep(jobId, 'extracting');
        const questionFiles = await Promise.all(
          files.map(async (file) => ({
            bytes: new Uint8Array(await file.arrayBuffer()),
            fileName: file.name,
          }))
        );

        const { reportId } = await createReportUsecase.execute({
          userId,
          files: questionFiles as any,
          onProgress: (step, extras) => {
            if (step === 'creating_report') setJobStep(jobId, 'creating_report');
            if (step === 'generating') setJobStep(jobId, 'generating');
            if (step === 'saving_questions') setJobStep(jobId, 'saving_questions', extras);
          },
        });

        linkReport(jobId, reportId);
        setJobStep(jobId, 'completed', { reportId });
      } catch (e) {
        const message = e instanceof Error ? e.message : '알 수 없는 오류';
        setJobStep(jobId, 'error', { errorMessage: message });
      }
    })();

    return NextResponse.json({ success: true, data: { jobId } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

//삭제
export async function DELETE(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: '리포트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const reportIdNumber = Number(reportId);

    // 리포트 존재 여부 및 소유권 확인
    const existingReport = await reportsRepository.findReportById(reportIdNumber);
    if (!existingReport) {
      return NextResponse.json(
        { success: false, message: '삭제할 리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingReport.userId !== userId) {
      return NextResponse.json(
        { success: false, message: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 리포트 삭제
    await deleteReportUsecase.execute(reportIdNumber);

    return NextResponse.json({ success: true, message: '리포트가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
