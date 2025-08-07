import { Reports } from '@/backend/domain/entities/Report';
import { IReportsRepository } from '@/backend/domain/repositories/IReportsRepository';

export class UpdateReportUsecase {
  constructor(private reportsRepository: IReportsRepository) {}

  async execute(reportId: number, updateData: Partial<Reports>): Promise<Reports> {
    return await this.reportsRepository.updateReport(reportId, updateData);
  }
}
