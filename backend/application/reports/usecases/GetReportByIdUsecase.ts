import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import { Reports } from '@/backend/domain/entities/Report';

export class GetReportByIdUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(reportId: number): Promise<Reports | null> {
    return await this.reportsRepository.findReportById(reportId);
  }
}
