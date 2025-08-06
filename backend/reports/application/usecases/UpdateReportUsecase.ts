import { IReportsRepository } from '../../domain/repositories/IReportsRepository';
import { Reports } from '../../domain/entities/Reports';

export class UpdateReportUsecase {
  constructor(private reportsRepository: IReportsRepository) {}

  async execute(reportId: number, updateData: Partial<Reports>): Promise<Reports> {
    return await this.reportsRepository.updateReport(reportId, updateData);
  }
}
