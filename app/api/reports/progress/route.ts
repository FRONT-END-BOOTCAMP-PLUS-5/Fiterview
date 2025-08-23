import { NextRequest, NextResponse } from 'next/server';
import { getJobProgress, getProgressByReportId } from '@/lib/server/progressStore';

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

    if (!state) {
      return NextResponse.json({ success: true, data: { step: 'started' } });
    }

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '진행 상태 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
