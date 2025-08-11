import { Reports } from '../entities/Report';

export interface ReportRepository {
  createReport(userId: number): Promise<Reports>;
}
