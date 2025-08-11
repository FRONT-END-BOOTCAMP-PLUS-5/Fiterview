import { NextRequest, NextResponse } from 'next/server';
import { GenerateSampleAnswerUsecase } from '@/backend/application/questions/usecases/GenerateSampleAnswerUsecase';
import { GPTSampleAnswerRepositoryImpl } from '@/backend/infrastructure/repositories/GPTSampleAnswerRepositoryImpl';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswerDto';
import { DeliverSampleAnswersDto } from '@/backend/application/questions/dtos/DeliverSampleAnswersDto';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questions_report_id = searchParams.get('questions_report_id');

    if (!questions_report_id) {
      return NextResponse.json(
        { error: 'questions_report_id query parameter is required' },
        { status: 400 }
      );
    }

    const questions_report_idNumber = parseInt(questions_report_id, 10);
    if (isNaN(questions_report_idNumber)) {
      return NextResponse.json(
        { error: 'questions_report_id must be valid numbers' },
        { status: 400 }
      );
    }
    // Create input DTO
    const inputDto = new GenerateSampleAnswersDto(
      questions_report_idNumber,
      'gpt-4o',
      'Return a JSON array of best answers to each question. Format: ["Best answer 1", "Best answer 2", "Best answer 3"]. Each answer should be a string that provides a comprehensive and well-structured response to the corresponding question.',
      '',
      1000
    );

    const prisma = new PrismaClient();
    const llm = new GPTSampleAnswerRepositoryImpl(inputDto);
    const usecase = new GenerateSampleAnswerUsecase(prisma, llm);
    const sampleAnswers = await usecase.execute(inputDto);

    const outputDto = new DeliverSampleAnswersDto(
      sampleAnswers.sample_answers_report_id,
      sampleAnswers.sample_answers
    );

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating sample answers:', error);
    return NextResponse.json({ error: 'Failed to generate sample answers' }, { status: 500 });
  }
}
