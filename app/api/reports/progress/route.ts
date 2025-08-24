import { NextRequest, NextResponse } from 'next/server';
import { getJobProgress, getProgressByReportId } from '@/lib/server/progressStore';
import { PROGRESS_STARTED_TIMEOUT_MS } from '@/constants/progress';

function timeoutErrorResponse() {
  return NextResponse.json({
    success: true,
    data: {
      step: 'error',
      errorMessage: '작업이 시작되지 않았습니다. 잠시 후 다시 시도해주세요.',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const reportIdParam = searchParams.get('reportId');

    if (!jobId && !reportIdParam) {
      return NextResponse.json(
        { success: false, message: 'jobId 또는 reportId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 메모리 저장소에서 현재 진행 상태 조회
    let state;
    if (jobId) {
      state = getJobProgress(jobId);
    } else if (reportIdParam) {
      const reportId = Number(reportIdParam);
      if (Number.isNaN(reportId)) {
        return NextResponse.json(
          { success: false, message: 'reportId가 올바르지 않습니다.' },
          { status: 400 }
        );
      }
      state = getProgressByReportId(reportId);
    }

    const timeoutMs = PROGRESS_STARTED_TIMEOUT_MS;
    if (!state) {
      // 상태가 아직 생성되지 않은 케이스
      return NextResponse.json({ success: true, data: { step: 'started' } });
    }

    if (state.step === 'started') {
      const updatedAtMs = (state as any).updatedAtMs as number | undefined;
      const now = Date.now();
      if (!updatedAtMs || now - updatedAtMs > timeoutMs) {
        return timeoutErrorResponse();
      }
    }

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '진행 상태 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
