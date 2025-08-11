export type ReportStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED';

export interface Reports {
  id: number;
  title: string;
  createdAt: Date;
  status: ReportStatus;
  userId: number;
  reflection?: string;
}
