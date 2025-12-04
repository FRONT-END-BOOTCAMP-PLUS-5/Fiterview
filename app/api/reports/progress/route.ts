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
      cancel() {
        // 스트림 취소 시 정리
      },
    });
    return new Response(body, {
      status: 400,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', //Nginx 버퍼링 비활성화
        'X-Content-Type-Options': 'nosniff', // 보안 헤더 설정
      },
    });
  }

  const intervalMs = 200;
  const keepAliveIntervalMs = 30000; // 30초마다 keep-alive
  let lastStateJson = '';
  let timer: NodeJS.Timeout | null = null;
  let keepAliveTimer: NodeJS.Timeout | null = null;
  let isClosed = false;

  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const cleanup = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        isClosed = true;
      };

      const send = (event: string, data: ProgressResponse) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(encodeEvent(event, data)));
        } catch (e) {
          // 스트림이 이미 닫혔거나 에러가 발생한 경우
          cleanup();
        }
      };

      const sendKeepAlive = () => {
        if (isClosed) return;
        try {
          // SSE 스펙에 따라 주석 메시지로 keep-alive 전송
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (e) {
          cleanup();
        }
      };

      send('open', { success: true, data: { step: 'started', reportId: 0, errorMessage: '' } });

      // 주기적으로 상태 체크
      timer = setInterval(() => {
        if (isClosed) {
          cleanup();
          return;
        }

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
            cleanup();
            send('end', payload);
            try {
              controller.close();
            } catch (e) {
              // 이미 닫혔을 수 있음
            }
          }
        } catch (e) {
          cleanup();
          send('error', {
            success: false,
            data: {
              step: 'error',
              reportId: 0,
              errorMessage: 'stream error',
            },
          });
          try {
            controller.close();
          } catch (err) {
            // 이미 닫혔을 수 있음
          }
        }
      }, intervalMs);

      // Keep-alive 메시지 전송 (연결 유지)
      keepAliveTimer = setInterval(() => {
        sendKeepAlive();
      }, keepAliveIntervalMs);

      // 클라이언트가 연결을 끊었을 때
      request.signal?.addEventListener('abort', () => {
        cleanup();
        try {
          send('end', {
            success: false,
            data: {
              step: 'error',
              reportId: 0,
              errorMessage: 'aborted',
            },
          });
        } catch (e) {
          // 무시
        } finally {
          try {
            controller.close();
          } catch (e) {
            // 이미 닫혔을 수 있음
          }
        }
      });
    },
    cancel() {
      // 클라이언트가 스트림을 취소했을 때 정리
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      isClosed = true;
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx 버퍼링 비활성화
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
