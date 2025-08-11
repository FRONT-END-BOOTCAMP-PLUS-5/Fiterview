import { PrismaClient } from '@prisma/client';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswerDto';
import { DeliverSampleAnswersDto } from '@/backend/application/questions/dtos/DeliverSampleAnswersDto';
import { GPTSampleAnswerRepositoryImpl } from '@/backend/infrastructure/repositories/GPTSampleAnswerRepositoryImpl';

export class GenerateSampleAnswerUsecase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly llmRepository: GPTSampleAnswerRepositoryImpl
  ) {}

  async execute(dto: GenerateSampleAnswersDto): Promise<DeliverSampleAnswersDto> {
    const reportId = dto.questions_report_id;

    // 1) Fetch up to 10 questions under the report, ordered
    const questions = await this.prisma.question.findMany({
      where: { reportId },
      select: { id: true, order: true, question: true },
      orderBy: { order: 'asc' },
      take: 10,
    });

    if (questions.length === 0) {
      return new DeliverSampleAnswersDto(reportId, []);
    }

    // 2) Build input from questions
    const input = questions.map((q) => `${q.question}`).join('\n');

    // 3) Ask LLM for sample answers
    const llmDto = new GenerateSampleAnswersDto(
      reportId,
      dto.model,
      dto.instructions,
      input,
      dto.maxOutputTokens
    );
    const raw = await this.llmRepository.generateSampleAnswer(llmDto);

    // 4) Parse into array (try JSON array; fallback to newline split)
    let answers: string[] = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        answers = JSON.parse(jsonMatch[0]);
      } else {
        answers = raw
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    } catch {
      answers = raw
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    // Ensure length alignment
    if (answers.length < questions.length) {
      answers = [...answers, ...Array(questions.length - answers.length).fill('')];
    } else if (answers.length > questions.length) {
      answers = answers.slice(0, questions.length);
    }

    // 5) Save into sampleAnswer column by question id
    await this.prisma.$transaction(
      questions.map((q, idx) =>
        this.prisma.question.update({
          where: { id: q.id },
          data: { sampleAnswer: answers[idx] },
        })
      )
    );

    return new DeliverSampleAnswersDto(reportId, answers);
  }
}
// legacy removed
