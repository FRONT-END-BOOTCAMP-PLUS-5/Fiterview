import { Report, ReportStatus } from '@/backend/domain/entities/Report';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export interface UpdateReportInput {
  title?: string;
  reflection?: string;
}

export class UpdateReportUsecase {
  constructor(private reportsRepository: ReportRepository) {}

  async execute(reportId: number, updateData: UpdateReportInput): Promise<Report> {
    const repoUpdate: Partial<Report> = {
      title: updateData.title,
      reflection: updateData.reflection,
    };
    return await this.reportsRepository.updateReport(reportId, repoUpdate);
  }
}
