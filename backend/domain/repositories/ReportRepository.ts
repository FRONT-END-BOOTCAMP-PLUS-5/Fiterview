import { Reports } from '../entities/Report';

export interface ReportRepository {
  createReport(userId: number): Promise<Reports>;
  updateReport(reportId: number, updateData: Partial<Reports>): Promise<Reports>;
  findAllReports(): Promise<Reports[]>;
  findReportById(reportId: number): Promise<Reports | null>;
}
