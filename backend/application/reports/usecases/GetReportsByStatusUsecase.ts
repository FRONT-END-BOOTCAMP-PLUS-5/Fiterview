import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import { Report, ReportStatus } from '@/backend/domain/entities/Report';

export class GetReportsByStatusUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(userId: number, status: ReportStatus): Promise<Report[]> {
    return this.reportsRepository.findReportsByStatus(userId, status);
  }
}
