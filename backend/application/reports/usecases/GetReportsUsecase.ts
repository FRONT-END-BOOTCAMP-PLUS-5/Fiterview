import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import { Report } from '@/backend/domain/entities/Report';

export class GetUserReportsUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(): Promise<Report[]> {
    return this.reportsRepository.findAllReports();
  }
}
