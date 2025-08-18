export type ReportStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED';

export interface Report {
  id: number;
  title: string;
  createdAt: Date;
  status: ReportStatus;
  userId: number;
  reflection?: string;
}
