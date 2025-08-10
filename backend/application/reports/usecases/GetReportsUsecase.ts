import { Reports } from '@/backend/domain/entities/Report';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export class GetReportsUsecase {
  constructor(private readonly reportsRepository: ReportRepository) {}

  async execute(): Promise<Reports[]> {
    try {
      const reports = await this.reportsRepository.findAllReports();
      return reports;
    } catch (error: unknown) {
      console.error('리포트 조회 오류:', error);
      throw new Error(
        `리포트 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
  }
}
