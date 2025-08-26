import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import { ReportStatus } from '@/backend/domain/entities/Report';

export class UpdateReportStatusUsecase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(reportId: number, status: ReportStatus): Promise<void> {
    try {
      // 현재 리포트 상태 확인
      const currentReport = await this.reportRepository.findReportById(reportId);
      if (!currentReport) {
        throw new Error(`Report with ID ${reportId} not found`);
      }

      // status만 업데이트
      await this.reportRepository.updateReportStatus(reportId, status);
    } catch (error) {
      throw error;
    }
  }
}
