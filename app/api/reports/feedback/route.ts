import { NextRequest, NextResponse } from 'next/server';
import { GenerateFeedbackUsecase } from '@/backend/application/feedbacks/usecases/GenerateFeedbackUsecase';
import { GPTFeedbackRepositoryImpl } from '@/backend/infrastructure/repositories/GPTFeedbackRepositoryImpl';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { DeliverFeedbackDto } from '@/backend/application/feedbacks/dtos/DeliverFeedbackDto';
import { FeedbackRepositoryImpl } from '@/backend/infrastructure/repositories/FeedbackRepositoryImpl';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questions_report_id = searchParams.get('questions_report_id');

    console.log('questions_report_id', questions_report_id);

    if (!questions_report_id) {
      return NextResponse.json(
        { error: 'questions_report_id query parameters are required' },
        { status: 400 }
      );
    }

    const reportId = parseInt(questions_report_id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: 'questions_report_id must be valid numbers' },
        { status: 400 }
      );
    }

    // Fetch questions and answers from the database
    const persistenceRepository = new FeedbackRepositoryImpl();
    const questionsAndAnswers = await persistenceRepository.getQuestionsAndAnswers(reportId);

    if (questionsAndAnswers.length === 0) {
      return NextResponse.json(
        { error: 'No questions with answers found for this report' },
        { status: 404 }
      );
    }

    const dto: RequestFeedbackDto = {
      reportId,
      pairs: questionsAndAnswers,
      model: 'gpt-4o',
      instructions: `아래 지침을 반드시 따르세요.

목표:

입력된 면접 질문과 sampleAnswer, userAnswer를 함께 고려하여 종합적인 평가를 수행합니다.

userAnswer에서의 말투와 논리적 흐름을 특히 주의 깊게 평가하고, 불필요한 반복 표현이나 어색한 말투, 논리 전개 등을 점검해 주세요.

출력 형식(매우 중요):

오직 JSON 객체 한 개만 출력하세요.

마크다운, 코드펜스, 설명 문장, 접두/접미 텍스트를 절대 포함하지 마세요.

출력은 반드시 { 로 시작해서 } 로 끝나야 합니다.

허용되는 키는 정확히 다음 세 개만 있습니다: score, strength, improvement. 다른 키는 포함하지 마세요.

JSON은 반드시 유효한 형식이어야 하며, 후행 쉼표를 넣지 마세요.

필드 규칙:

score: 0 이상 100 이하의 정수(Integer). userAnswer의 논리성, 명료성, 직무 적합성 등을 고려하여 점수를 매기세요.

strength: 한국어 문장들의 배열(무조건 2개). 각 원소는 1문장의 간결한 강점 서술. 사용자 답변에서 돋보이는 부분을 설명합니다.

improvement: 한국어 문장들의 배열(무조건 2개). 각 원소는 구체적이고 실행 가능한 개선 제안. 반복되는 표현, 논리적 비약, 말투 등을 개선할 수 있는 방안을 제시합니다.

평가 기준:

sampleAnswer와 userAnswer를 비교하여 정확성, 논리성, 구성/전달력, 직무 적합성을 종합적으로 평가하세요.

userAnswer가 불완전하거나 반복적인 표현이 많더라도 가능한 범위 내에서 평가를 일관되게 진행하세요.

특히, 사용자 답변에서 논리적인 흐름과 직관적인 설명이 잘 전달되고 있는지, 말투에서 불필요한 표현을 줄이고 더 명확한 문장 구조를 사용하는지 체크해 주세요.

말투가 어색하거나 반복적인 경우, 구체적인 개선점을 제시해 주세요.`,
      maxOutputTokens: 1000,
    };

    const llmRepo = new GPTFeedbackRepositoryImpl(dto);
    const usecase = new GenerateFeedbackUsecase(llmRepo, persistenceRepository);
    const feedback = await usecase.execute(dto);

    const outputDto: DeliverFeedbackDto = {
      feedback_report_id: feedback.feedback_report_id,
      score: feedback.score,
      strength: feedback.strength,
      improvement: feedback.improvement,
    };

    return NextResponse.json(outputDto, { status: 200 });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
