# Hedra Avatar App

AI 음성 어시스턴트와 실시간 대화할 수 있는 웹 애플리케이션입니다. LiveKit과 Hedra의 가상 아바타 기술을 활용하여 자연스러운 음성 대화 경험을 제공합니다.

## 주요 기능

- 🎭 **가상 아바타**: Hedra 기술을 활용한 실시간 아바타 생성
- 🗣️ **음성 대화**: OpenAI의 Realtime API를 통한 자연스러운 음성 대화
- 👤 **사용자 인증**: 회원가입/로그인 시스템
- 🎨 **커스터마이징**: 사용자 정의 아바타 이미지와 프롬프트 설정
- 📝 **실시간 전사**: 음성 대화의 실시간 텍스트 변환
- 📊 **로그 관리**: Agent 프로세스 로그 모니터링

## 기술 스택

### Frontend
- **Next.js 14** - React 기반 웹 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **LiveKit Components** - 실시간 음성/영상 통신
- **Framer Motion** - 애니메이션

### Backend
- **NestJS** - Node.js 기반 백엔드 프레임워크
- **TypeORM** - ORM (Object-Relational Mapping)
- **SQLite** - 경량 데이터베이스
- **JWT** - 인증 토큰
- **bcrypt** - 비밀번호 암호화

### AI Agent
- **Python** - Agent 워커
- **LiveKit Agents** - 실시간 AI Agent 프레임워크
- **OpenAI Realtime API** - 음성 AI 모델
- **Hedra Plugin** - 아바타 생성

## 시작하기

### 필요 조건

- Node.js 18 이상
- Python 3.8 이상
- pnpm (권장 패키지 매니저)
- npm (NestJS 백엔드용)

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# LiveKit 설정
LIVEKIT_URL=your_livekit_server_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# AI 서비스
OPENAI_API_KEY=your_openai_api_key
HEDRA_API_KEY=your_hedra_api_key

# NestJS 백엔드 (backend-nestjs/.env)
JWT_SECRET=your_jwt_secret_key
DATABASE_PATH=./database.sqlite
```

### 설치 및 실행

#### 1. 의존성 설치

```bash
# 루트 디렉토리에서
npm install

# 프론트엔드 의존성 설치
cd frontend
pnpm install

# AI Agent 의존성 설치
cd ../backend
pip install -r requirements.txt

# NestJS 백엔드 의존성 설치
cd ../backend-nestjs
npm install
```

## 🚀 실행 방법

### 1. 프론트엔드 실행
```bash
# 프론트엔드 의존성 설치 및 실행
npm run start-app
# 또는
cd frontend && pnpm install && pnpm dev
```

### 2. AI 에이전트 실행
```bash
# Python 에이전트 의존성 설치 및 실행
npm run start-agent
# 또는
cd backend && pip install -r requirements.txt && python agent_worker.py start
```

### 3. NestJS 백엔드 실행 (중요!)
```bash
# NestJS 백엔드 의존성 설치 및 실행
npm run start-backend
# 또는
cd backend-nestjs && npm install && npm run start:dev
```

**⚠️ 주의사항**: 로그인/회원가입 기능을 사용하려면 반드시 NestJS 백엔드를 먼저 실행해야 합니다!

### 4. 환경 변수 설정
프론트엔드에서 `.env.local` 파일을 생성하고 다음을 설정하세요:
```bash
# 백엔드 API URL (중요!)
NEXT_PUBLIC_API_URL=http://localhost:3001

# 기타 필요한 환경 변수들...
```

## 🔧 문제 해결

### 로그인/회원가입이 안 되는 경우
1. **백엔드가 실행 중인지 확인**: `npm run start-backend` 실행
2. **포트 확인**: 백엔드가 3001 포트에서 실행되고 있는지 확인
3. **환경 변수 확인**: `NEXT_PUBLIC_API_URL`이 올바르게 설정되었는지 확인
4. **브라우저 콘솔 확인**: 네트워크 오류나 CORS 오류 메시지 확인

### 백엔드 연결 오류 시
- 백엔드 서버가 실행되지 않았거나
- 포트가 이미 사용 중이거나
- 환경 변수가 잘못 설정되었을 수 있습니다

## 📱 주요 기능

1. **회원가입/로그인**: 처음 접속 시 계정을 생성하거나 로그인하세요.

2. **대화 시작**: "Start a conversation" 버튼을 클릭하세요.

3. **아바타 설정**: 
   - 아바타 이미지 선택 (기본 제공 또는 사용자 정의)
   - AI 어시스턴트 프롬프트 설정

4. **음성 대화**: 마이크 권한을 허용하고 자연스럽게 대화하세요.

5. **실시간 전사**: 대화 내용이 실시간으로 텍스트로 표시됩니다.

## 프로젝트 구조

```
avatar/
├── frontend/                 # Next.js 프론트엔드
│   ├── app/                 # App Router 페이지
│   ├── components/          # React 컴포넌트
│   ├── contexts/           # React Context
│   ├── hooks/              # 커스텀 훅
│   └── types/              # TypeScript 타입 정의
├── backend/                 # Python AI Agent 워커
│   ├── agent_worker.py     # 메인 Agent 로직
│   ├── assets/             # 아바타 이미지 파일
│   └── requirements.txt    # Python 의존성
├── backend-nestjs/          # NestJS 백엔드 서버
│   ├── src/
│   │   ├── auth/           # 인증 모듈 (JWT, 회원가입/로그인)
│   │   ├── board/          # 게시판 모듈
│   │   ├── survey/         # 유가족 설문조사 모듈
│   │   ├── entities/       # TypeORM 엔티티 (SQLite)
│   │   ├── app.module.ts   # 메인 애플리케이션 모듈
│   │   └── main.ts         # 애플리케이션 진입점
│   ├── package.json        # Node.js 의존성
│   └── database.sqlite     # SQLite 데이터베이스 파일
└── src/                    # 레거시 NestJS 소스 (참고용)
    ├── auth/               # 인증 모듈
    ├── board/              # 게시판 모듈
    ├── survey/             # 설문 모듈
    └── entities/           # 데이터베이스 엔티티
```

## API 엔드포인트

### Frontend API Routes (Next.js)

- `POST /api/start-agent` - Agent 프로세스 시작
- `POST /api/connection-details` - LiveKit 연결 정보 획득
- `POST /api/cleanup-agent` - Agent 프로세스 정리
- `GET /api/agent-logs` - Agent 로그 조회

### NestJS Backend API (포트 3001)

#### 인증 (Auth)
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `GET /auth/profile` - 프로필 조회 (JWT 필요)

#### 게시판 (Board)
- `GET /boards` - 게시글 목록 조회
- `GET /boards/:id` - 특정 게시글 조회
- `POST /boards` - 게시글 작성 (JWT 필요)
- `PATCH /boards/:id` - 게시글 수정 (JWT 필요)
- `DELETE /boards/:id` - 게시글 삭제 (JWT 필요)

#### 카테고리 (Category)
- `GET /categories` - 카테고리 목록 조회
- `GET /categories/:id` - 특정 카테고리 조회
- `POST /categories` - 카테고리 생성 (관리자 권한 필요)
- `PATCH /categories/:id` - 카테고리 수정 (관리자 권한 필요)
- `DELETE /categories/:id` - 카테고리 삭제 (관리자 권한 필요)

#### 설문조사 (Survey)
- `POST /surveys` - 설문조사 제출 (JWT 필요)
- `GET /surveys/my-survey` - 내 설문조사 조회 (JWT 필요)
- `PATCH /surveys/my-survey` - 내 설문조사 수정 (JWT 필요)
- `DELETE /surveys/my-survey` - 내 설문조사 삭제 (JWT 필요)
- `GET /surveys/all` - 모든 설문조사 조회 (관리자 권한 필요)
- `GET /surveys/statistics` - 설문조사 통계 (관리자 권한 필요)

## 커스터마이징

### 아바타 이미지 추가

`backend/assets/` 디렉토리에 이미지 파일을 추가하고, `AgentConfigModal.tsx`에서 이미지 옵션을 업데이트하세요.

### AI 어시스턴트 프롬프트 수정

Agent 설정 모달에서 사용자 정의 프롬프트를 입력하거나, `agent_worker.py`의 기본 프롬프트를 수정하세요.

## 개발 도구

### 코드 포맷팅

```bash
cd frontend
pnpm format:write  # 코드 포맷팅
pnpm format:check  # 포맷팅 확인
```

### 린팅

```bash
cd frontend
pnpm lint
```

### 정리

```bash
cd frontend
pnpm cleanup  # 임시 파일 정리
```

## 문제 해결

### 일반적인 문제

1. **마이크 권한 오류**: 브라우저에서 마이크 권한을 허용했는지 확인하세요.

2. **Agent 연결 실패**: 
   - 환경 변수가 올바르게 설정되었는지 확인
   - Agent 프로세스가 실행 중인지 확인
   - 네트워크 연결 상태 확인

3. **아바타 로딩 실패**: Hedra API 키가 유효한지 확인하세요.

### 로그 확인

Agent 로그는 `backend/agent_worker.log` 파일에서 확인할 수 있으며, 웹 인터페이스의 로그 모달에서도 실시간으로 확인 가능합니다.

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**참고 자료**
- [LiveKit Documentation](https://docs.livekit.io/)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Hedra API Documentation](https://docs.hedra.com/)
