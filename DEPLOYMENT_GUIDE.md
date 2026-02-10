# 배포 가이드 (Deployment Guide)

## ✅ 완료된 작업

1. ✅ Supabase 데이터베이스 스키마 생성 (`supabase-schema.sql`)
2. ✅ Supabase 클라이언트 설정 (`js/supabase-client.js`)
3. ✅ 로그인/회원가입 UI 추가
4. ✅ 인증 로직 구현 (signup, login, logout)
5. ✅ 게임 결과 Supabase 저장 기능
6. ✅ 전역 순위표 조회 기능
7. ✅ CSS 스타일 추가 (인증 UI + 다크모드)
8. ✅ Git 초기화 및 커밋

## 🚀 다음 단계

### 1. Supabase 프로젝트 설정

#### A. 프로젝트 생성
1. https://supabase.com 접속
2. "New Project" 클릭
3. Organization 선택 또는 생성
4. 프로젝트 정보 입력:
   - Name: `quizbook` (또는 원하는 이름)
   - Database Password: 안전한 비밀번호 생성
   - Region: 가장 가까운 지역 선택 (예: Northeast Asia (Seoul))
5. "Create new project" 클릭 (약 2분 소요)

#### B. 데이터베이스 스키마 실행
1. Supabase Dashboard에서 왼쪽 메뉴 "SQL Editor" 클릭
2. "New query" 클릭
3. `supabase-schema.sql` 파일의 전체 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭 (Cmd/Ctrl + Enter)
5. 성공 메시지 확인

#### C. 이메일 확인 비활성화
1. Authentication → Settings 메뉴
2. "Email Auth" 섹션 찾기
3. "Confirm email" 토글을 **OFF**로 설정
4. "Save" 클릭

#### D. API 키 복사
1. Settings → API 메뉴
2. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...` (긴 JWT 토큰)

### 2. 환경 변수 설정

`js/supabase-client.js` 파일을 열고 다음 부분을 수정:

```javascript
// 이 부분을 수정하세요
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';  // ← 복사한 Project URL로 교체
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // ← 복사한 anon key로 교체
```

예시:
```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

변경 후 저장하고 커밋:
```bash
git add js/supabase-client.js
git commit -m "Configure Supabase credentials"
```

### 3. GitHub 레포지토리 생성

#### 옵션 A: GitHub CLI 사용 (권장)

GitHub CLI가 설치되어 있지 않다면 먼저 설치:
```bash
# macOS (Homebrew)
brew install gh

# 인증
gh auth login
```

레포지토리 생성:
```bash
cd "/Users/jasonhan/Library/CloudStorage/Dropbox/Adir/code/vibe/quiz/quizbook"
gh repo create quizbook --public --source=. --remote=origin --push
```

#### 옵션 B: 웹에서 수동 생성

1. https://github.com/new 접속
2. 레포지토리 정보 입력:
   - Repository name: `quizbook`
   - Description: `상식 퀴즈북 - Supabase 백엔드를 활용한 4지선다형 퀴즈 게임`
   - Visibility: Public
   - **DO NOT initialize with README** (이미 있음)
3. "Create repository" 클릭
4. 터미널에서 다음 명령어 실행:

```bash
cd "/Users/jasonhan/Library/CloudStorage/Dropbox/Adir/code/vibe/quiz/quizbook"
git remote add origin https://github.com/YOUR_USERNAME/quizbook.git
git branch -M main
git push -u origin main
```

### 4. Vercel 배포

#### 옵션 A: Vercel CLI 사용

```bash
# Vercel CLI 설치 (없는 경우)
npm install -g vercel

# 로그인
vercel login

# 배포
cd "/Users/jasonhan/Library/CloudStorage/Dropbox/Adir/code/vibe/quiz/quizbook"
vercel

# 프로덕션 배포
vercel --prod
```

#### 옵션 B: Vercel Dashboard 사용

1. https://vercel.com 접속 및 가입
2. "New Project" 클릭
3. GitHub 계정 연결
4. `quizbook` 레포지토리 선택
5. **Build Settings**는 기본값 그대로 (Static Site)
6. "Deploy" 클릭
7. 배포 완료 후 URL 확인 (예: `https://quizbook.vercel.app`)

### 5. 테스트

#### A. 로컬 테스트
```bash
# Python 서버로 로컬 테스트
cd "/Users/jasonhan/Library/CloudStorage/Dropbox/Adir/code/vibe/quiz/quizbook"
python -m http.server 8000
```

브라우저에서 http://localhost:8000 접속

#### B. 배포 테스트
1. Vercel URL 접속
2. 회원가입 → 계정 생성 확인
3. 로그인 → 인증 상태 UI 확인
4. 퀴즈 플레이 → 결과 저장 확인
5. Supabase Dashboard → Table Editor → `game_sessions` 테이블에서 데이터 확인
6. 통계 화면 → 순위표 확인
7. 로그아웃 → 게스트 모드 확인

### 6. 검증 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 실행 완료 (3개 테이블 생성)
- [ ] 이메일 확인 비활성화 완료
- [ ] API 키 설정 완료 (`js/supabase-client.js`)
- [ ] Git 커밋 완료 (credentials 포함)
- [ ] GitHub 레포지토리 생성 및 푸시 완료
- [ ] Vercel 배포 완료
- [ ] 회원가입/로그인 테스트 성공
- [ ] 게임 플레이 및 데이터 저장 확인
- [ ] 순위표 작동 확인

## 🔧 트러블슈팅

### 문제: 로그인 시 "Invalid login credentials" 오류
- **원인**: 비밀번호가 너무 짧음 (최소 6자)
- **해결**: 6자 이상 비밀번호 사용

### 문제: 게임 결과가 Supabase에 저장되지 않음
- **확인사항**:
  1. 브라우저 콘솔에서 에러 메시지 확인
  2. `js/supabase-client.js`의 SUPABASE_URL과 ANON_KEY 확인
  3. Supabase Dashboard → Authentication → Users에서 사용자 확인
  4. Supabase Dashboard → Table Editor → `game_sessions`에서 RLS 정책 확인

### 문제: 회원가입 후 "Please verify your email" 메시지
- **원인**: 이메일 확인이 활성화되어 있음
- **해결**: Authentication → Settings → "Confirm email" 비활성화

### 문제: CORS 에러 발생
- **원인**: localhost에서는 발생하지 않지만, 다른 도메인에서 발생 가능
- **해결**: Supabase Dashboard → Settings → API → "Site URL" 추가

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 공식 문서](https://vercel.com/docs)
- [GitHub 공식 문서](https://docs.github.com)

## 🆘 도움이 필요하신가요?

문제가 발생하면 GitHub Issues에 남겨주세요!
