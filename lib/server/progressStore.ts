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
}

const jobProgressMap = new Map<string, JobProgressState>();
const reportIdToJobIdMap = new Map<number, string>();

export function createJob(jobId: string) {
  jobProgressMap.set(jobId, { step: 'started' });
}

export function setJobStep(
  jobId: string,
  step: JobProgressStep,
  extra?: { reportId?: number; errorMessage?: string }
) {
  const prev = jobProgressMap.get(jobId) || { step: 'started' };
  const next: JobProgressState = {
    ...prev,
    step,
    errorMessage: extra?.errorMessage,
    reportId: extra?.reportId ?? prev.reportId,
  };
  jobProgressMap.set(jobId, next);
  if (extra?.reportId !== undefined) {
    reportIdToJobIdMap.set(extra.reportId, jobId);
  }
}

export function linkReport(jobId: string, reportId: number) {
  const prev = jobProgressMap.get(jobId) || { step: 'started' };
  jobProgressMap.set(jobId, { ...prev, reportId });
  reportIdToJobIdMap.set(reportId, jobId);
}

export function getJobProgress(jobId: string): JobProgressState | undefined {
  return jobProgressMap.get(jobId);
}

export function getProgressByReportId(reportId: number): JobProgressState | undefined {
  const jobId = reportIdToJobIdMap.get(reportId);
  if (!jobId) return undefined;
  return jobProgressMap.get(jobId);
}
