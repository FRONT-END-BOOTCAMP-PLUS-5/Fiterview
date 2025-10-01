import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';

export const QUESTIONS_GENERATION_PROMPT = `업로드되는 파일(이력서, 자기소개서, 채용공고)을 분석해 지원자 적합성을 평가할 수 있는 면접 질문 10개를 작성하세요.

조건:
1. 이력·경험·공고 요구사항 모두 반영.
2. 최소 3개 이상은 공고 핵심 자격요건/기술스택 확인.
3. 질문 어투는 구어체, 실제 면접관처럼 자연스럽게.
4. 각 질문은 100자 이내, 한 번에 하나의 주제만.
}`;

export const DEFAULT_GENERATED_QUESTIONS: QuestionsResponse[] = [
  { order: 1, question: '본인의 주요 기술 스택과 경험에 대해 설명해주세요.' },
  { order: 2, question: '가장 도전적이었던 프로젝트와 그 과정에서 배운 점은 무엇인가요?' },
  { order: 3, question: '팀 프로젝트에서 갈등이 발생했을 때 어떻게 해결하시나요?' },
  { order: 4, question: '새로운 기술을 학습하는 방법과 최근 학습한 기술은 무엇인가요?' },
  { order: 5, question: '코드 품질을 유지하기 위해 어떤 방법들을 사용하시나요?' },
  { order: 6, question: '업무 외 개인 프로젝트나 오픈소스 기여 경험이 있나요?' },
  { order: 7, question: '압박감 속에서도 효율적으로 일할 수 있는 본인만의 방법은 무엇인가요?' },
  { order: 8, question: '데이터베이스 설계나 최적화 경험이 있다면 설명해주세요.' },
  { order: 9, question: '사용자 경험을 개선한 경험이 있다면 구체적으로 설명해주세요.' },
  { order: 10, question: '앞으로의 커리어 목표와 회사에서 기대하는 역할은 무엇인가요?' },
];
