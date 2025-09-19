# 🧑🏻‍💻 AI 맞춤 모의면접 웹서비스 Fiterview

<img width="1920" height="1080" alt="프로젝트 소개" src="https://github.com/user-attachments/assets/64df0e95-f45a-4a0a-9c26-21aba5e3b460" />

- 배포 URL : https://fiterview.com/
- Test ID : test2
- Test PW : !test1234

<br>

## 프로젝트 소개

- Fiterview는 이력서와 채용공고 기반 AI 맞춤 모의면접 서비스입니다.
- 포트폴리오와 채용공고를 기반으로 맞춤형 면접 질문을 생성할 수 있습니다.
- AI 아바타와의 면접을 통해 실전처럼 연습이 가능합니다.
- 면접이 끝나면 AI분석을 통해 피드백이 포함된 상세레포트를 확인할 수 있습니다.

<br>

## 팀원 구성

<div align="center">

|                                                                           **김지나**                                                                            | **송가은** | **송진호** | **신주현** |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------: | :--------: | :--------: |
| [<img src="https://github.com/user-attachments/assets/a5aecbe5-1fcf-4ec8-98a5-dcd1c51e2a74" height=150 width=120> <br/> @jina4066](https://github.com/jina4066) |            |            |            |

</div>

<br>

## 1. 개발 환경

### Frontend

Next.js 15.4.5 (App Router), TypeScript
Tailwind CSS, Framer Motion
Three.js, React Three Fiber (3D Graphics)

### Backend

- Next.js API Routes (풀스택 아키텍처)
  -PostgreSQL, Prisma ORM
- NextAuth.js (Authentication)

### Data & State Management

- React Query (TanStack Query) - 서버 상태 관리
- Zustand - 클라이언트 상태 관리

### AI Services

- OpenAI GPT-4o, Google Gemini (LLM)
- OpenAI Whisper (Speech-to-Text)
- Google Cloud TTS (Text-to-Speech)

### Development

- Yarn, ESLint, Prettier
- GitHub, Discord, Notion
  <br>

## 2. 브랜치 전략

- Git-flow 전략을 기반으로 main, develop 브랜치와 feature 보조 브랜치를 운용했습니다.
- main, develop, Feat 브랜치로 나누어 개발을 하였습니다.
  - **main** 브랜치는 배포 단계에서만 사용하는 브랜치입니다.
  - **develop** 브랜치는 개발 단계에서 git-flow의 master 역할을 하는 브랜치입니다.
  - **Feat** 브랜치는 기능 단위로 독립적인 개발 환경을 위하여 사용하고 merge 후 각 브랜치를 삭제해주었습니다.

<br>

## 3. 프로젝트 구조

```
Fiterview/
├── �� Frontend (Next.js App Router)
│   ├── app/
│   │   ├── (anon)/              # 인증되지 않은 사용자 페이지
│   │   │   ├── components/      # 페이지별 컴포넌트
│   │   │   ├── interview/       # 면접 관련 페이지
│   │   │   ├── reports/         # 리포트 관련 페이지
│   │   │   ├── login/           # 로그인 페이지
│   │   │   └── signup/          # 회원가입 페이지
│   │   ├── api/                 # Backend API Routes
│   │   │   ├── auth/            # 인증 API
│   │   │   ├── reports/         # 리포트 API
│   │   │   └── questions/       # 질문 API
│   │   └── components/          # 공통 컴포넌트
│   │       ├── layout/          # 레이아웃 컴포넌트
│   │       ├── modal/           # 모달 컴포넌트
│   │       └── provider/        # Context Provider
│   └── globals.css
│
├── 🏛️ Backend (Clean Architecture)
│   └── backend/
│       ├── application/         # Use Cases Layer
│       │   ├── auth/           # 인증 유스케이스
│       │   ├── reports/        # 리포트 유스케이스
│       │   ├── questions/      # 질문 유스케이스
│       │   └── feedbacks/      # 피드백 유스케이스
│       ├── domain/             # Domain Layer
│       │   ├── entities/       # 도메인 엔티티
│       │   ├── repositories/   # 리포지토리 인터페이스
│       │   └── AI/            # AI 도메인 서비스
│       └── infrastructure/     # Infrastructure Layer
│           ├── repositories/   # 리포지토리 구현체
│           ├── AI/            # AI 서비스 구현체
│           └── services/      # 외부 서비스
│
├── 🗄️ Database
│   └── prisma/
│       ├── schema.prisma       # 데이터베이스 스키마
│       └── migrations/         # 마이그레이션 파일
│
├── 🎨 Assets & Resources
│   ├── public/
│   │   ├── assets/            # 정적 자산
│   │   │   ├── icons/         # SVG 아이콘
│   │   │   ├── audios/        # 오디오 파일
│   │   │   └── env/           # 3D 환경 파일
│   │   └── fonts/             # 폰트 파일
│   └── constants/             # 상수 정의
│
├── �� Utilities & Hooks
│   ├── hooks/                 # 커스텀 훅
│   ├── stores/                # Zustand 스토어
│   ├── lib/                   # 유틸리티 라이브러리
│   ├── utils/                 # 헬퍼 함수
│   └── types/                 # TypeScript 타입 정의
│
└── ⚙️ Configuration
    ├── package.json
    ├── tsconfig.json
    ├── eslint.config.mjs
    └── next.config.ts
```

<br>

## 4. 역할 분담

### 김지나

- **UI**
  - 페이지 :
  - 공통 컴포넌트 :
- **기능**
  -

### 송가은

- **UI**
  - 페이지 :
  - 공통 컴포넌트 :
- **기능**
  -

### 신주현

- **UI**
  - 페이지 :
  - 공통 컴포넌트 :
- **기능**
  -

<br>

## 5. 페이지별 기능
