import { Reports } from '@/backend/domain/entities/Report';
import { IReportsRepository } from '@/backend/domain/repositories/IReportsRepository';

export class CreateReportUsecase {
  constructor(private readonly reportsRepository: IReportsRepository) {}

  async execute(userId: number): Promise<Reports> {
    if (!userId || userId <= 0) {
      throw new Error('유효한 사용자 ID가 필요합니다.');
    }

    try {
      const createdReport = await this.reportsRepository.createReport(userId);
      return createdReport;
    } catch (error: unknown) {
      throw new Error(
        `리포트 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
  }
}
