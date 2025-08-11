import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export class DeleteReportUsecase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(reportId: number): Promise<void> {
    // 리포트 존재 여부 확인
    const existingReport = await this.reportRepository.findReportById(reportId);

    if (!existingReport) {
      throw new Error('삭제할 리포트를 찾을 수 없습니다.');
    }

    // 리포트 삭제
    await this.reportRepository.deleteReport(reportId);
  }
}
