import { Reports } from '../entities/Reports';

export interface IReportsRepository {
  createReport(userId: number): Promise<Reports>;
  updateReflection(reportId: number, reflection: string): Promise<Reports>;
  updateTitle(reportId: number, title: string): Promise<Reports>;
  findAllReports(): Promise<Reports[]>;
}
