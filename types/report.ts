export const REPORT_STATUS = {
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING',
  COMPLETED: 'COMPLETED',
} as const;
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
