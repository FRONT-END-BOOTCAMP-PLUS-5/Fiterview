import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export class UpdateReportOrderUsecase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(reportId: number, currentOrder: number): Promise<void> {
    const report = await this.reportRepository.findReportById(reportId);
    if (!report) {
      throw new Error(`${reportId} 리포트를 찾을 수 없습니다.`);
    }

    await this.reportRepository.updateReportOrder(reportId, currentOrder);
  }
}
