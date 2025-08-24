import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { LlmAI } from '@/backend/domain/AI/LlmAI';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export interface CreateReportInput {
  userId: number;
  files: QuestionsRequest[];
  onProgress?: (
    step: 'creating_report' | 'generating' | 'saving_questions',
    extras?: { reportId?: number }
  ) => void;
}

export interface CreateReportResult {
  reportId: number;
}

export class CreateReportUsecase {
  constructor(
    private reportRepository: ReportRepository,
    private llmAI: LlmAI
  ) {}

  async execute({ userId, files, onProgress }: CreateReportInput): Promise<CreateReportResult> {
    onProgress?.('generating');
    const generated = await this.llmAI.generateQuestions(files);

    onProgress?.('creating_report');
    const report = await this.reportRepository.createReport(userId);

    onProgress?.('saving_questions', { reportId: report.id });
    await this.llmAI.saveQuestions(generated, report.id);

    return { reportId: report.id };
  }
}
