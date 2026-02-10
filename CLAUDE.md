# 상식 퀴즈북

4지선다 상식 퀴즈 게임. 로컬 파일 전용 (서버 배포 없음).

## 프로젝트 구조

```
quizbook/
├── index.html          # 메인 HTML (5개 화면: 시작/모드선택/퀴즈/결과/통계)
├── css/
│   └── style.css       # 전체 스타일링 (반응형)
└── js/
    ├── questions.js    # 문제 데이터 40개 + 유틸 함수 (QUESTIONS, CATEGORIES, shuffleArray, getQuestionsByCategory)
    └── game.js         # 게임 로직, 상태 관리, ScoreManager, LocalDataManager, SoundManager
```

## 기술 스택

- Vanilla JS (프레임워크 없음, 빌드 도구 없음)
- 로컬 파일 실행 (`index.html`을 브라우저에서 직접 열기)
- localStorage로 데이터 저장 (key: `quizbook_data`, 레거시 호환: `quizbook_history`)

## 핵심 아키텍처

- **전역 상태**: `state` 객체에 모든 게임 상태 관리
- **화면 전환**: `showScreen(screenId)`로 `.screen.active` 토글
- **DOM 접근**: `const $ = id => document.getElementById(id)` 헬퍼 사용
- **스크립트 로드 순서**: questions.js → game.js (전역 스코프 공유)

## 게임 모드

| 모드 | 문제 수 | 시간 제한 | 문제 구성 |
|------|---------|-----------|-----------|
| 전체 도전 (full) | 40 | 없음 | 카테고리별 10문제씩 순서대로 |
| 카테고리별 (category) | 10 | 없음 | 선택 카테고리만 |
| 스피드 (speed) | 20 | 15초/문제 | 전체에서 랜덤 |

## 점수 체계 (ScoreManager)

- 기본: 정답 시 +10점
- 시간 보너스: 10초 이내 답변 +3점
- 노힌트 보너스: 힌트 미사용 +2점
- 콤보 보너스: 3연속 +2, 5연속 +3, 7연속 +4, 10연속 +5

## 문제 데이터 (questions.js)

- 4개 카테고리: 한국사, 과학, 지리, 예술과 문화
- 카테고리별 10문제, 총 40문제
- 각 문제: `{ id, category, difficulty, question, options[4], correctAnswer, explanation }`

## 구현 현황

- [x] 1단계: 핵심 퀴즈 시스템 (MVP)
- [x] 2단계: 점수 시스템 및 게임 모드 확장
- [x] 3단계: 데이터 저장/순위/통계/다크모드/사운드

## 퀴즈 문제 교차 검증 가이드라인
모든 문제 작성 시 확인 사항
1. 정답이 하나뿐인가?
- 다른 해석 가능 시 조건 명시 (예: 면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가?
- ‘가장 큰’, ‘최초의’ 등 표현에 측정 기준 명시
3. 시간과 범위가 명확한가?
- 변할 수 있는 정보는 시점 명시
- 지리적, 분류적 범위 한정
4. 교차 검증했는가?
- 의심스러운 정보는 2개 이상 출처 확인
- 논란 있는 내용은 주류 학설 기준
