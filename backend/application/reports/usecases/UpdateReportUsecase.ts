import { Reports, ReportStatus } from '@/backend/domain/entities/Report';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export interface UpdateReportInput {
  title?: string;
  reflection?: string;
  status?: ReportStatus;
}

export class UpdateReportUsecase {
  constructor(private reportsRepository: ReportRepository) {}

  async execute(reportId: number, updateData: UpdateReportInput): Promise<Reports> {
    const repoUpdate: Partial<Reports> = {
      title: updateData.title,
      reflection: updateData.reflection,
      status: updateData.status,
    };
    return await this.reportsRepository.updateReport(reportId, repoUpdate);
  }
}
