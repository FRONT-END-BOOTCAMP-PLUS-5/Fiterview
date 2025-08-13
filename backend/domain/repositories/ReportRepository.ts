import { Reports, ReportStatus } from '../entities/Report';

export interface ReportRepository {
  createReport(userId: number): Promise<Reports>;
  updateReport(reportId: number, updateData: Partial<Reports>): Promise<Reports>;
  updateReportStatus(reportId: number, status: ReportStatus): Promise<void>;
  findAllReports(): Promise<Reports[]>;
  findReportsByUserId(userId: number): Promise<Reports[]>;
  findReportsByStatus(userId: number, status: ReportStatus): Promise<Reports[]>;
  findReportById(reportId: number): Promise<Reports | null>;
  deleteReport(reportId: number): Promise<void>;
}
