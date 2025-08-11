import { NextRequest, NextResponse } from 'next/server';
import { GenerateBestAnswerUsecase } from '@/backend/application/questions/usecases/GenerateBestAnswerUsecase';
import { GPTBestAnswerRepository } from '@/backend/infrastructure/repositories/GPTBestAnswerRepository';
import { GenerateBestAnswersDto } from '@/backend/application/questions/dtos/GenerateBestAnswersDto';
import { DeliverBestAnswersDto } from '@/backend/application/questions/dtos/DeliverBestAnswersDto';

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
    const inputDto = new GenerateBestAnswersDto(
      questions_report_idNumber,
      'gpt-4o',
      'Return a JSON array of best answers to each question. Format: ["Best answer 1", "Best answer 2", "Best answer 3"]. Each answer should be a string that provides a comprehensive and well-structured response to the corresponding question.',
      '',
      1000
    );

    const bestAnswerRepository = new GPTBestAnswerRepository(inputDto);
    const generateBestAnswerUsecase = new GenerateBestAnswerUsecase(bestAnswerRepository);
    const bestAnswers = await generateBestAnswerUsecase.execute(inputDto);

    const outputDto = new DeliverBestAnswersDto(
      bestAnswers.best_answers_report_id,
      bestAnswers.best_answers
    );

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating best answers:', error);
    return NextResponse.json({ error: 'Failed to generate best answers' }, { status: 500 });
  }
}
