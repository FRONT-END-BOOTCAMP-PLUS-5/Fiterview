export type JobProgressStep =
  | 'started'
  | 'extracting'
  | 'generating'
  | 'creating_report'
  | 'saving_questions'
  | 'completed'
  | 'error';

export interface JobProgressState {
  step: JobProgressStep;
  reportId?: number;
  errorMessage?: string;
  createdAtMs: number;
  updatedAtMs: number;
}

class InMemoryProgressStore {
  private readonly jobProgressMap = new Map<string, JobProgressState>();
  private readonly reportIdToJobIdMap = new Map<number, string>();

  createJob(jobId: string) {
    const now = Date.now();
    this.jobProgressMap.set(jobId, { step: 'started', createdAtMs: now, updatedAtMs: now });
  }

  setJobStep(
    jobId: string,
    step: JobProgressStep,
    extra?: { reportId?: number; errorMessage?: string }
  ) {
    const prev =
      this.jobProgressMap.get(jobId) ||
      ({ step: 'started', createdAtMs: Date.now(), updatedAtMs: Date.now() } as JobProgressState);
    const next: JobProgressState = {
      ...prev,
      step,
      errorMessage: extra?.errorMessage,
      reportId: extra?.reportId ?? prev.reportId,
      updatedAtMs: Date.now(),
    };
    this.jobProgressMap.set(jobId, next);
    if (extra?.reportId !== undefined) {
      this.reportIdToJobIdMap.set(extra.reportId, jobId);
    }
  }

  linkReport(jobId: string, reportId: number) {
    const now = Date.now();
    const prev =
      this.jobProgressMap.get(jobId) ||
      ({ step: 'started', createdAtMs: now, updatedAtMs: now } as JobProgressState);
    this.jobProgressMap.set(jobId, { ...prev, reportId, updatedAtMs: now });
    this.reportIdToJobIdMap.set(reportId, jobId);
  }

  getJobProgress(jobId: string): JobProgressState | undefined {
    return this.jobProgressMap.get(jobId);
  }

  getProgressByReportId(reportId: number): JobProgressState | undefined {
    const jobId = this.reportIdToJobIdMap.get(reportId);
    if (!jobId) return undefined;
    return this.jobProgressMap.get(jobId);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __fiterview_progressStore: InMemoryProgressStore | undefined;
}

function getStore(): InMemoryProgressStore {
  if (!globalThis.__fiterview_progressStore) {
    globalThis.__fiterview_progressStore = new InMemoryProgressStore();
  }
  return globalThis.__fiterview_progressStore;
}

export function createJob(jobId: string) {
  return getStore().createJob(jobId);
}

export function setJobStep(
  jobId: string,
  step: JobProgressStep,
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
