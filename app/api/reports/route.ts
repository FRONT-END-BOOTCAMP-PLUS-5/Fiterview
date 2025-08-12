import { NextRequest, NextResponse } from 'next/server';
import { CreateReportUsecase } from '@/backend/application/reports/usecases/CreateReportUsecase';
import { ReportRepositoryImpl } from '@/backend/infrastructure/repositories/ReportRepositoryImpl';
import { QuestionRepositoryImpl } from '@/backend/infrastructure/repositories/QuestionRepositoryImpl';
import { GetUserReportsUsecase } from '@/backend/application/reports/usecases/GetUserReportsUsecase';
import { ReportDto } from '@/backend/application/reports/dtos/ReportDto';

const reportsRepository = new ReportRepositoryImpl();
const questionRepository = new QuestionRepositoryImpl();
const getUserReportsUsecase = new GetUserReportsUsecase(reportsRepository);
const createReportUsecase = new CreateReportUsecase(reportsRepository, questionRepository);

// userId 검증
const parseUserId = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const badRequest = (message: string) =>
  NextResponse.json({ success: false, message }, { status: 400 });

//조회
export async function GET(request: NextRequest) {
  try {
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
    const userId = parseUserId(searchParams.get('userId'));
    const status = parseStatus(searchParams.get('status'));

    if (userId === null) return badRequest('userId가 필요합니다.');

    const reports = await getUserReportsUsecase.execute(userId, status);
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
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = parseUserId(
      typeof formData.get('userId') === 'string' ? (formData.get('userId') as string) : null
    );

    //로그인 유저 확인
    if (userId === null) return badRequest('userId가 필요합니다.');
    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: '파일이 필요합니다.' }, { status: 400 });
    }

    // 파일 확인
    const questionFiles = await Promise.all(
      files.map(async (file) => ({
        bytes: new Uint8Array(await file.arrayBuffer()),
        fileName: file.name,
      }))
    );

    const result = await createReportUsecase.execute({ userId, files: questionFiles });

    return NextResponse.json({ success: true, data: result });
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
