import { QuestionRepository } from '../../domain/repositories/QuestionRepository';
import {
  Question,
  QuestionFile,
  QuestionGenerationResult,
  QuestionCreationResult,
  GeneratedQuestion,
} from '../../domain/entities/Question';
import { GoogleAIProvider } from '../../../infrastructure/providers/GoogleAIProvider';
import { PrismaClient } from '@prisma/client';
import mime from 'mime-types';

export class PrismaQuestionRepository implements QuestionRepository {
  private googleAIProvider: GoogleAIProvider;
  private prisma: PrismaClient;

  constructor() {
    this.googleAIProvider = new GoogleAIProvider();
    this.prisma = new PrismaClient();
  }

  // AI로 질문 생성
  async generateQuestions(files: QuestionFile[]): Promise<QuestionGenerationResult> {
    try {
      const questions = await this.generateQuestionsWithGemini(files);
      return { questions };
    } catch (error) {
      throw new Error(
        `질문 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // 생성된 질문들을 DB에 저장
  async saveQuestions(
    generatedQuestions: GeneratedQuestion[],
    reportId: number
  ): Promise<QuestionCreationResult> {
    try {
      // number 순서대로 정렬
      const sortedQuestions = generatedQuestions.sort((a, b) => a.number - b.number);

      const savedQuestions = await this.prisma.$transaction(
        sortedQuestions.map((genQuestion) =>
          this.prisma.question.create({
            data: {
              question: genQuestion.question,
              reportId: reportId,
            },
          })
        )
      );

      return {
        questions: savedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          sampleAnswer: q.sampleAnswer || undefined,
          userAnswer: q.userAnswer || undefined,
          recording: q.recording || undefined,
          reportId: q.reportId,
        })),
        reportId,
      };
    } catch (error) {
      throw new Error(
        `질문 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async generateQuestionsWithGemini(files: QuestionFile[]): Promise<GeneratedQuestion[]> {
    const prompt = `다음에 업로드되는 파일들(이력서, 자기소개서, 채용공고)을 분석하세요.  
분석 결과를 바탕으로, 해당 지원자가 해당 채용 포지션에 맞는지 평가할 수 있도록 면접관이 실제로 말하는 것처럼 자연스러운 어투의 질문을 10개 작성하세요.

조건:
1. 질문은 지원자의 포트폴리오, 이력서 경험, 채용공고의 요구사항을 모두 반영할 것.
2. 질문 중 최소 3개 이상은 채용공고의 핵심 자격 요건과 기술 스택을 지원자가 실제로 갖추었는지 확인하는 내용으로 작성할 것.
3. 질문 어투는 문서체가 아닌 구어체로, 면접관이 직접 묻는 듯한 느낌으로 작성할 것.  
   예: "다른 상태 관리 라이브러리(예: Redux, Recoil)와 비교하여" ❌  
       "Redux, Recoil 같은 다른 상태 관리 라이브러리와 비교해서" ⭕
4. 각 질문은 실제 면접에서 말할 수 있는 길이(최대 100자)로 제한할 것.
5. 각 질문은 한 번에 하나의 주제만 물어볼 것.
6. 출력 형식은 반드시 아래 JSON 구조만 사용할 것.

JSON 구조:
{
  "questions": [
    {
      "number": 1,
      "question": "면접관 질문 내용",
    }
  ]
}`;

    const genAI = this.googleAIProvider.getClient();

    // 파일들을 Gemini에 전달할 형태로 변환
    const fileParts = files.map((file) => {
      const mimeType = this.getMimeType(file.fileName);

      return {
        inlineData: {
          mimeType,
          data: file.buffer.toString('base64'),
        },
      };
    });

    // 프롬프트와 파일들을 함께 전달
    const contents = [{ text: prompt }, ...fileParts];

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error('응답 텍스트가 없습니다');
    }

    try {
      // JSON 응답 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 응답을 찾을 수 없습니다');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.questions || [];
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답:', responseText);

      // 파싱 실패 시 기본 질문 반환
      return this.generateDefaultQuestions();
    }
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();

    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      default:
        return mime.lookup(fileName) || 'application/octet-stream';
    }
  }

  private generateDefaultQuestions(): GeneratedQuestion[] {
    return [
      {
        number: 1,
        question: '본인의 주요 기술 스택과 경험에 대해 설명해주세요.',
      },
      {
        number: 2,
        question: '가장 도전적이었던 프로젝트와 그 과정에서 배운 점은 무엇인가요?',
      },
      {
        number: 3,
        question: '팀 프로젝트에서 갈등이 발생했을 때 어떻게 해결하시나요?',
      },
      {
        number: 4,
        question: '새로운 기술을 학습하는 방법과 최근 학습한 기술은 무엇인가요?',
      },
      {
        number: 5,
        question: '코드 품질을 유지하기 위해 어떤 방법들을 사용하시나요?',
      },
      {
        number: 6,
        question: '업무 외 개인 프로젝트나 오픈소스 기여 경험이 있나요?',
      },
      {
        number: 7,
        question: '압박감 속에서도 효율적으로 일할 수 있는 본인만의 방법은 무엇인가요?',
      },
      {
        number: 8,
        question: '데이터베이스 설계나 최적화 경험이 있다면 설명해주세요.',
      },
      {
        number: 9,
        question: '사용자 경험을 개선한 경험이 있다면 구체적으로 설명해주세요.',
      },
      {
        number: 10,
        question: '앞으로의 커리어 목표와 회사에서 기대하는 역할은 무엇인가요?',
      },
    ];
  }
}
