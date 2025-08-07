import { Reports } from '../entities/Report';

export interface IReportsRepository {
  createReport(userId: number): Promise<Reports>;
  updateReport(reportId: number, updateData: Partial<Reports>): Promise<Reports>;
  findAllReports(): Promise<Reports[]>;
  findReportById(reportId: number): Promise<Reports | null>;
}
