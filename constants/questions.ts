import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';

export const QUESTIONS_GENERATION_PROMPT = `다음에 업로드되는 파일들(이력서, 자기소개서, 채용공고)을 분석하세요.  
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
      "order": 1,
      "question": "면접관 질문 내용",
    }
  ]
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
