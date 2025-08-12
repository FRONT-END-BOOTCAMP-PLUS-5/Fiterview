import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import { Reports, ReportStatus } from '@/backend/domain/entities/Report';

export class GetUserReportsUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(userId: number, status?: ReportStatus): Promise<Reports[]> {
    return this.reportsRepository.findReportsByUserId(userId, status);
  }
}
