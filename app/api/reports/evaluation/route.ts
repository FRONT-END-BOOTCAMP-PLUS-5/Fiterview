import { NextRequest, NextResponse } from 'next/server';
import { GenerateEvaluationUsecase } from '@/backend/application/evaluations/usecases/GenerateEvaluationUsecase';
import { GPTEvaluationRepository } from '@/backend/infrastructure/repositories/GPTEvaluationRepository';
import { GenerateEvaluationDto } from '@/backend/application/evaluations/dtos/GenerateEvaluationDto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questions_report_id = searchParams.get('questions_report_id');
    const answers_report_id = searchParams.get('answers_report_id');

    if (!questions_report_id || !answers_report_id) {
      return NextResponse.json(
        { error: 'questions_report_id and answers_report_id query parameters are required' },
        { status: 400 }
      );
    }

    const questions_report_idNumber = parseInt(questions_report_id, 10);
    const answers_report_idNumber = parseInt(answers_report_id, 10);
    if (isNaN(questions_report_idNumber) || isNaN(answers_report_idNumber)) {
      return NextResponse.json(
        { error: 'questions_report_id and answers_report_id must be valid numbers' },
        { status: 400 }
      );
    }

    const evaluationService = new GPTEvaluationRepository(
      new GenerateEvaluationDto(
        questions_report_idNumber,
        answers_report_idNumber,
        'gpt-4o',
        'Return a JSON object with a numeric "score" between 0 and 100. Example: {"score": 85}',
        '',
        1000
      )
    );
    const generateEvaluationUsecase = new GenerateEvaluationUsecase(evaluationService);

    // Create input DTO
    const inputDto = new GenerateEvaluationDto(
      questions_report_idNumber,
      answers_report_idNumber,
      'gpt-4o',
      'Return a JSON object with a numeric "score" between 0 and 100. Example: {"score": 85}',
      '',
      1000
    );

    // Execute usecase
    // Use the repository through the usecase (constructor carries config)
    const evaluation = await generateEvaluationUsecase.execute(inputDto);

    // Create output DTO
    const outputDto = {
      questions_report_id: evaluation.evaluation_report_id,
      score: evaluation.score,
    };

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating evaluation:', error);
    return NextResponse.json({ error: 'Failed to generate evaluation' }, { status: 500 });
  }
}
