import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';
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
    private questionRepository: QuestionRepository
  ) {}

  async execute({ userId, files }: CreateReportInput): Promise<CreateReportResult> {
    // 1) 리포트 생성
    const report = await this.reportRepository.createReport(userId);

    // 2) 질문 생성 및 저장
    const generated = await this.questionRepository.generateQuestions(files);
    await this.questionRepository.saveQuestions(generated, report.id);

    return { reportId: report.id };
  }
}
