import { NextRequest, NextResponse } from 'next/server';
import { GenerateSampleAnswerUsecase } from '@/backend/application/questions/usecases/GenerateSampleAnswerUsecase';
import { GPTSampleAnswerRepositoryImpl } from '@/backend/infrastructure/repositories/GPTSampleAnswerRepositoryImpl';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswerDto';
import { DeliverSampleAnswersDto } from '@/backend/application/questions/dtos/DeliverSampleAnswersDto';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const questions_report_idNumber = parseInt(resolvedParams.id, 10);

    if (isNaN(questions_report_idNumber)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Create input DTO
    const inputDto: GenerateSampleAnswersDto = {
      reportId: questions_report_idNumber,
      model: 'gpt-4o',
      instructions:
        'Return a JSON array of best answers to each question. Format: ["Best answer 1", "Best answer 2", "Best answer 3"]. Each answer should be a string that provides a comprehensive and well-structured response to the corresponding question.',
      input: '',
      maxOutputTokens: 1000,
    };

    const prisma = new PrismaClient();
    const llm = new GPTSampleAnswerRepositoryImpl(inputDto);
    const usecase = new GenerateSampleAnswerUsecase(prisma, llm);
    const sampleAnswers = await usecase.execute(inputDto);

    const outputDto: DeliverSampleAnswersDto = {
      reportId: sampleAnswers.reportId,
      sample_answers: sampleAnswers.sample_answers,
    };

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating sample answers:', error);
    return NextResponse.json({ error: 'Failed to generate sample answers' }, { status: 500 });
  }
}
