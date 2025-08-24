import { ProgressStep } from '@/types/progress';

export const PROGRESS_STEPS: ProgressStep[] = [
  'started',
  'extracting',
  'generating',
  'creating_report',
  'saving_questions',
  'completed',
];

export const PROGRESS_STARTED_TIMEOUT_MS = 8000;

export const STORAGE_KEYS = {
  FITERVIEW_JOB_ID: 'fiterview_job_id',
} as const;
