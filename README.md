# 상식 퀴즈북 (QuizBook)

다양한 분야의 상식을 테스트하는 4지선다형 퀴즈 게임입니다. Supabase 백엔드를 활용한 사용자 인증, 점수 저장, 전역 순위표 기능을 제공합니다.

## 🎯 주요 기능

### 게임 모드
- **전체 도전**: 4개 카테고리 40문제 (한국사, 과학, 지리, 예술과 문화)
- **카테고리별 도전**: 원하는 카테고리 10문제 집중 학습
- **스피드 퀴즈**: 문제당 15초 제한, 랜덤 20문제

### 점수 시스템
- 기본 점수: 정답 시 +10점
- 시간 보너스: 10초 이내 답변 +3점
- 노힌트 보너스: 힌트 미사용 +2점
- 콤보 보너스: 연속 정답 시 추가 점수 (3연속 +2, 5연속 +3, 7연속 +4, 10연속 +5)

### 사용자 기능
- 🔐 회원가입/로그인 (이메일 확인 불필요)
- 📊 개인 통계 및 성장 그래프
- 🏆 전역 순위표 (전체/이번 주/오늘)
- 💾 게임 기록 자동 저장
- 🌙 다크 모드 지원
- 🔊 사운드 효과
- 📱 반응형 디자인

## 🚀 배포하기

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com) 가입 및 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용 실행
3. Authentication → Settings에서 "Confirm email" 옵션 비활성화
4. Settings → API에서 다음 정보 복사:
   - Project URL
   - anon/public key

### 2. 환경 변수 설정

`js/supabase-client.js` 파일에서 다음을 수정:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Vercel 배포

#### 방법 1: Vercel CLI (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 2: Vercel Dashboard

1. [Vercel](https://vercel.com) 가입
2. "New Project" 클릭
3. GitHub 레포지토리 연결
4. Deploy 클릭

## 💻 로컬 실행

빌드 도구 없이 바로 실행 가능합니다:

```bash
# 간단히 index.html을 브라우저에서 열기
open index.html

# 또는 로컬 서버 사용 (권장)
python -m http.server 8000
# http://localhost:8000 접속
```

## 📁 프로젝트 구조

```
quizbook/
├── index.html              # 메인 HTML
├── css/
│   └── style.css           # 전체 스타일링
├── js/
│   ├── questions.js        # 문제 데이터 (40개)
│   ├── supabase-client.js  # Supabase 클라이언트 설정
│   └── game.js             # 게임 로직 및 인증
├── supabase-schema.sql     # Supabase 데이터베이스 스키마
└── README.md
```

## 🗄️ 데이터베이스 스키마

- **game_sessions**: 각 게임 세션 기록 (점수, 정답률, 응답시간 등)
- **user_stats**: 사용자별 집계 통계 (총 게임 수, 최고 점수 등)
- **user_profiles**: 사용자 프로필 정보

### 자동 기능
- 게임 완료 시 `user_stats` 자동 업데이트 (트리거)
- 회원가입 시 `user_profiles` 자동 생성 (트리거)
- Row Level Security (RLS) 정책으로 데이터 보안

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript (프레임워크 없음)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Styling**: CSS Variables + Dark Mode
- **Audio**: Web Audio API
- **Storage**: localStorage (fallback) + Supabase

## 📝 데이터 마이그레이션

게스트로 플레이한 기록은 로그인 후 자동으로 Supabase에 이관됩니다.

## 🔒 보안

- RLS (Row Level Security) 정책으로 데이터 접근 제어
- 사용자는 자신의 데이터만 수정 가능
- 전역 순위표는 모두에게 읽기 권한 부여

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 PR을 환영합니다!

## 📧 문의

문제가 발생하면 GitHub Issues를 통해 문의해주세요.
