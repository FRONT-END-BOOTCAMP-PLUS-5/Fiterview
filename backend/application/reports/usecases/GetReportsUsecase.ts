import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import { Reports } from '@/backend/domain/entities/Report';

export class GetUserReportsUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(): Promise<Reports[]> {
    return this.reportsRepository.findAllReports();
  }
}
