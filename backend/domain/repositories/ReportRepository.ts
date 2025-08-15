import { Report, ReportStatus } from '../entities/Report';

export interface ReportRepository {
  createReport(userId: number): Promise<Report>;
  updateReport(reportId: number, updateData: Partial<Report>): Promise<Report>;
  updateReportStatus(reportId: number, status: ReportStatus): Promise<void>;
  findAllReports(): Promise<Report[]>;
  findReportsByUserId(userId: number): Promise<Report[]>;
  findReportsByStatus(userId: number, status: ReportStatus): Promise<Report[]>;
  findReportById(reportId: number): Promise<Report | null>;
}
