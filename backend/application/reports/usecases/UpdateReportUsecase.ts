import { Reports } from '@/backend/domain/entities/Report';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
export class UpdateReportUsecase {
  constructor(private reportsRepository: ReportRepository) {}

  async execute(reportId: number, updateData: Partial<Reports>): Promise<Reports> {
    return await this.reportsRepository.updateReport(reportId, updateData);
  }
}
