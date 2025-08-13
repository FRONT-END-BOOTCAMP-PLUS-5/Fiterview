import { PrismaClient } from '@prisma/client';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswerDto';
import { DeliverSampleAnswersDto } from '@/backend/application/questions/dtos/DeliverSampleAnswersDto';
import { Gpt4oLlmAI } from '@/backend/infrastructure/ai/Gpt4oLlmAI';

export class GenerateSampleAnswerUsecase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly llmRepository: Gpt4oLlmAI
  ) {}

  async execute(dto: GenerateSampleAnswersDto): Promise<DeliverSampleAnswersDto> {
    const reportId = dto.reportId;

    // 1) Fetch up to 10 questions under the report, ordered
    const questions = await this.prisma.question.findMany({
      where: { reportId },
      select: { id: true, order: true, question: true },
      orderBy: { order: 'asc' },
      take: 10,
    });

    if (questions.length === 0) {
      return {
        reportId: reportId,
        sample_answers: [],
      };
    }

    // 2) Build input from questions
    const input = questions.map((q) => `${q.question}`).join('\n');

    // 3) Create DTO for LLM
    const llmDto = new GenerateSampleAnswersDto(reportId, dto.model, dto.instructions, input);
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

    return {
      reportId: reportId,
      sample_answers: answers,
    };
  }
}
// legacy removed
