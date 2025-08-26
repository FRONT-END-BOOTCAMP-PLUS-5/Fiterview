import { ProgressStep } from '@/types/progress';

export interface JobProgressState {
  step: ProgressStep;
  reportId?: number;
  errorMessage?: string;
  createdAtMs: number;
  updatedAtMs: number;
}

class InMemoryProgressStore {
  // jobId를 키로 하는 작업 진행 상태 맵
  private readonly jobProgressMap = new Map<string, JobProgressState>();
  // reportId를 키로 하는 jobId 매핑 맵 (역방향 조회용)
  private readonly reportIdToJobIdMap = new Map<number, string>();
  // TTL(Time To Live) 타이머 맵 - 완료/에러된 작업을 자동으로 정리하기 위함
  private readonly ttlTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // started 상태 반복 카운팅을 위한 맵
  private readonly startedCountMap = new Map<string, number>();
  private readonly MAX_STARTED_COUNT = 10;

  // 단계 순서 정의
  private readonly STEP_ORDER: ProgressStep[] = [
    'started',
    'extracting',
    'generating',
    'creating_report',
    'saving_questions',
    'completed',
  ];

  createJob(jobId: string) {
    const now = Date.now();
    this.jobProgressMap.set(jobId, { step: 'started', createdAtMs: now, updatedAtMs: now });
    // started 상태 카운트 초기화
    this.startedCountMap.set(jobId, 1);
  }

  setJobStep(
    jobId: string,
    step: ProgressStep,
    extra?: { reportId?: number; errorMessage?: string }
  ) {
    // 기존 상태가 없으면 기본값으로 초기화
    const prev =
      this.jobProgressMap.get(jobId) ||
      ({ step: 'started', createdAtMs: Date.now(), updatedAtMs: Date.now() } as JobProgressState);

    // 다른 상태로 변경되면 started 카운트 리셋
    if (prev.step === 'started' && step !== 'started') {
      this.startedCountMap.delete(jobId);
    }

    // 2. 역방향 진행 감지 (이전 단계로 돌아가는 경우)
    if (this.isReverseProgress(prev.step, step)) {
      const errorState: JobProgressState = {
        ...prev,
        step: 'error',
        updatedAtMs: Date.now(),
      };
      this.jobProgressMap.set(jobId, errorState);
      this.clearJob(jobId);
      return;
    }

    // 3. 비정상적인 상태 변화 감지 (순서에 맞지 않는 변화)
    if (this.isAbnormalProgress(prev.step, step)) {
      const errorState: JobProgressState = {
        ...prev,
        step: 'error',
        updatedAtMs: Date.now(),
      };
      this.jobProgressMap.set(jobId, errorState);
      this.clearJob(jobId);
      return;
    }

    const next: JobProgressState = {
      ...prev,
      step,
      errorMessage: extra?.errorMessage,
      reportId: extra?.reportId ?? prev.reportId,
      updatedAtMs: Date.now(),
    };

    this.jobProgressMap.set(jobId, next);

    // 완료/에러 시 TTL 클린업 예약(2분 후 자동 제거)
    if (step === 'completed' || step === 'error') {
      this.scheduleClear(jobId, 1000 * 60 * 2);
    }
    if (extra?.reportId !== undefined) {
      this.reportIdToJobIdMap.set(extra.reportId, jobId);
    }
  }

  // 역방향 진행 감지 (이전 단계로 돌아가는 경우)
  private isReverseProgress(prevStep: ProgressStep, currentStep: ProgressStep): boolean {
    const prevIndex = this.STEP_ORDER.indexOf(prevStep);
    const currentIndex = this.STEP_ORDER.indexOf(currentStep);

    // 이전 단계로 돌아가는 경우 (인덱스가 감소)
    return prevIndex > currentIndex;
  }

  // 비정상적인 상태 변화 감지 (순서에 맞지 않는 변화)
  private isAbnormalProgress(prevStep: ProgressStep, currentStep: ProgressStep): boolean {
    const prevIndex = this.STEP_ORDER.indexOf(prevStep);
    const currentIndex = this.STEP_ORDER.indexOf(currentStep);

    // 현재 단계가 이전 단계에서 2단계 이상 건너뛰는 경우
    return currentIndex > prevIndex + 1;
  }

  // 작업과 리포트를 연결
  linkReport(jobId: string, reportId: number) {
    const now = Date.now();
    const prev =
      this.jobProgressMap.get(jobId) ||
      ({ step: 'started', createdAtMs: now, updatedAtMs: now } as JobProgressState);
    this.jobProgressMap.set(jobId, { ...prev, reportId, updatedAtMs: now });
    this.reportIdToJobIdMap.set(reportId, jobId);
  }

  //진행 상태 조회
  getJobProgress(jobId: string): JobProgressState | undefined {
    let state = this.jobProgressMap.get(jobId);

    // 서버 재시작으로 인한 상태 손실
    if (!state) {
      const errorState: JobProgressState = {
        step: 'error',
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      };
      this.jobProgressMap.set(jobId, errorState);
      return errorState;
    }

    // started 상태 반복 체크
    if (state.step === 'started') {
      const currentCount = (this.startedCountMap.get(jobId) || 0) + 1;
      this.startedCountMap.set(jobId, currentCount);

      // started 상태가 10번 이상 지속되면 에러로 처리
      if (currentCount >= this.MAX_STARTED_COUNT) {
        const errorState: JobProgressState = {
          ...state,
          step: 'error',
          updatedAtMs: Date.now(),
        };
        this.jobProgressMap.set(jobId, errorState);

        // 에러 상태를 반환 (clearJob은 즉시 호출하지 않음)
        return errorState;
      }
    }

    return state;
  }

  getProgressByReportId(reportId: number): JobProgressState | undefined {
    const jobId = this.reportIdToJobIdMap.get(reportId);
    if (!jobId) return undefined;
    return this.jobProgressMap.get(jobId);
  }

  clearJob(jobId: string) {
    const state = this.jobProgressMap.get(jobId);
    if (state?.reportId !== undefined) {
      this.reportIdToJobIdMap.delete(state.reportId);
    }
    this.jobProgressMap.delete(jobId);
    this.startedCountMap.delete(jobId);
    const t = this.ttlTimers.get(jobId);
    if (t) clearTimeout(t);
    this.ttlTimers.delete(jobId);
  }

  private scheduleClear(jobId: string, delayMs: number) {
    const existing = this.ttlTimers.get(jobId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => this.clearJob(jobId), delayMs);
    this.ttlTimers.set(jobId, timer);
  }
}

declare global {
  var __fiterview_progressStore: InMemoryProgressStore | undefined;
}

function getStore(): InMemoryProgressStore {
  if (!globalThis.__fiterview_progressStore) {
    globalThis.__fiterview_progressStore = new InMemoryProgressStore();
  }
  return globalThis.__fiterview_progressStore;
}

// ===== 공개 함수들 =====
// 외부에서 사용할 수 있도록 저장소 메서드들을 래핑

export function createJob(jobId: string) {
  return getStore().createJob(jobId);
}

export function setJobStep(
  jobId: string,
  step: ProgressStep,
  extra?: { reportId?: number; errorMessage?: string }
) {
  return getStore().setJobStep(jobId, step, extra);
}

export function linkReport(jobId: string, reportId: number) {
  return getStore().linkReport(jobId, reportId);
}

export function getJobProgress(jobId: string): JobProgressState | undefined {
  return getStore().getJobProgress(jobId);
}

export function getProgressByReportId(reportId: number): JobProgressState | undefined {
  return getStore().getProgressByReportId(reportId);
}

export function clearJob(jobId: string) {
  return getStore().clearJob(jobId);
}
