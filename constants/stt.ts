// STT 호출 시 모델에 전달되는 도메인 bias prompt.
// 면접 도메인의 자주 등장하는 기술 용어와 표기 정책을 모델에게 힌트로 준다.
// raw 텍스트의 인식 품질에 영향을 주므로 변경 시 benchmark 재측정 필요.
export const STT_PROMPT_BIAS = [
  '한국어 IT/기술 면접 답변 음성입니다.',
  '자주 등장하는 용어: React, Next.js, TypeScript, JavaScript, Node.js, Python, Java, Spring, Spring Boot, Django, FastAPI, AWS, GCP, Azure, Docker, Kubernetes, MySQL, PostgreSQL, MongoDB, Redis, REST API, GraphQL, Git, GitHub, CI/CD, OAuth, JWT.',
  '직무 용어: 프론트엔드, 백엔드, 풀스택, 데브옵스, 데이터베이스, 알고리즘, 자료구조, 객체지향, 함수형, 비동기, 동시성, 트랜잭션, 인덱스.',
  '숫자는 가능한 한 아라비아 숫자로 표기합니다 (예: 3년, 10000명).',
].join(' ');

// 후처리에서 제거 대상이 되는 한국어 filler 토큰.
// 단독 토큰 또는 같은 음절의 반복 형태만 제거한다 (예: "어", "어어", "음음음").
// 일반 단어로 흔히 쓰이는 "그", "저", "뭐"는 오제거 위험이 커 포함하지 않는다.
export const FILLER_TOKENS = ['어', '음', '에', '아'] as const;
