import { ReportStatus } from '@/backend/domain/entities/Report';

export interface ReportDto {
  id: number;
  title: string;
  createdAt: string;
  status: ReportStatus;
  userId: number;
  reflection?: string;
}
