import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export class GetReportOrderByIdUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(reportId: number): Promise<number | null> {
    return await this.reportsRepository.findReportOrderById(reportId);
  }
}
