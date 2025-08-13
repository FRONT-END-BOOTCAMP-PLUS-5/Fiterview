import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { LlmAI } from '@/backend/domain/ai/LlmAI';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export interface CreateReportInput {
  userId: number;
  files: QuestionsRequest[];
}

export interface CreateReportResult {
  reportId: number;
}

export class CreateReportUsecase {
  constructor(
    private reportRepository: ReportRepository,
    private llmAI: LlmAI
  ) {}

  async execute({ userId, files }: CreateReportInput): Promise<CreateReportResult> {
    // 1) 리포트 생성
    const report = await this.reportRepository.createReport(userId);

    // 2) 질문 생성 및 저장
    const generated = await this.llmAI.generateQuestions(files);
    await this.llmAI.saveQuestions(generated, report.id);

    return { reportId: report.id };
  }
}
