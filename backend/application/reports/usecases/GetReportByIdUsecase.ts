import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import { Report } from '@/backend/domain/entities/Report';

export class GetReportByIdUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(reportId: number): Promise<Report | null> {
    return await this.reportsRepository.findReportById(reportId);
  }
}
