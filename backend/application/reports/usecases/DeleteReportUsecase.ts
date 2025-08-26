import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';
import fs from 'fs/promises';
import path from 'path';

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

    // 리포트 삭제 후 녹음 파일도 삭제
    try {
      const targetDir = path.join(process.cwd(), 'public', 'assets', 'audios', String(reportId));
      await fs.rm(targetDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('DeleteReportUsecase 녹음 파일 삭제 실패', err);
    }
  }
}
