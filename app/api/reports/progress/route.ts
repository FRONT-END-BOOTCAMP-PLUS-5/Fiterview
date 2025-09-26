import { NextRequest } from 'next/server';
import {
  getJobProgress,
  getProgressByReportId,
  JobProgressState,
} from '@/lib/server/progressStore';
import { ProgressResponse } from '@/types/progress';

function encodeEvent(event: string, data: ProgressResponse): string {
  return `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
}

export const dynamic = 'force-dynamic';

function getProgress(
  jobId?: string | null,
  reportIdParam?: string | null
): JobProgressState | undefined {
  if (jobId) return getJobProgress(jobId);
  if (reportIdParam) {
    const rid = Number(reportIdParam);
    if (!Number.isNaN(rid)) return getProgressByReportId(rid);
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const reportIdParam = searchParams.get('reportId');

  if (!jobId && !reportIdParam) {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            encodeEvent('error', {
              success: false,
              data: {
                step: 'error',
                reportId: 0,
                errorMessage: 'jobId 또는 reportId가 필요합니다.',
              },
            })
          )
        );
        controller.close();
      },
    });
    return new Response(body, {
      status: 400,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  const intervalMs = 200;
  let lastStateJson = '';

  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: ProgressResponse) => {
        controller.enqueue(encoder.encode(encodeEvent(event, data)));
      };

      send('open', { success: true, data: { step: 'started', reportId: 0, errorMessage: '' } });

      const timer = setInterval(() => {
        try {
          const state = getProgress(jobId, reportIdParam);
          const payload = {
            success: true,
            data: {
              step: state?.step ?? 'started',
              reportId: state?.reportId ?? 0,
              errorMessage: state?.errorMessage ?? '',
            },
          };
          const json = JSON.stringify(payload);
          // 상태가 변경된 경우에만 전송
          if (json !== lastStateJson) {
            lastStateJson = json;
            send('message', payload);
          }

          const step = state?.step;
          if (step === 'completed' || step === 'error') {
            clearInterval(timer);
            send('end', payload);
            controller.close();
          }
        } catch (e) {
          clearInterval(timer);
          send('error', {
            success: false,
            data: {
              step: 'error',
              reportId: 0,
              errorMessage: 'stream error',
            },
          });
          controller.close();
        }
      }, intervalMs);

      request.signal?.addEventListener('abort', () => {
        clearInterval(timer);
        try {
          send('end', {
            success: false,
            data: {
              step: 'error',
              reportId: 0,
              errorMessage: 'aborted',
            },
          });
        } finally {
          controller.close();
        }
      });
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
