퀴즈 게임의 순위(리더보드) 시스템을 관리하라.

## 대상 파일

- js/game.js — `LocalDataManager.getTopScores()`, `LocalDataManager.getResultsFiltered()`, `renderLeaderboard()`, `filterLeaderboard()`, `renderHistory()`
- css/style.css — `.lb-item`, `.lb-rank`, `.lb-filter`, `.leaderboard-list`, `.history-item` 등 순위 UI 스타일
- index.html — `#tab-leaderboard`, `#leaderboard-filter`, `#leaderboard-list`, `#history-section` 등 순위 화면 HTML

## 기능

$ARGUMENTS 에 따라 아래 기능 중 하나를 실행한다. 인자가 없으면 사용자에게 물어본다.

### 1. `report` — 순위 시스템 현황 보고

현재 순위 시스템의 구현 상태를 분석하고 보고한다:

- **순위표 위치**: 통계 화면 > 순위표 탭 + 결과 화면 > 순위 기록 섹션
- **데이터 소스**: `LocalDataManager.getTopScores(limit)`, `getResultsFiltered(period, category)`
- **필터링**: 기간별 (전체/이번주/오늘), `timestamp` 기반 필터
- **정렬 기준**: 점수 내림차순 (`b.score - a.score`)
- **표시 한도**: 순위표 상위 10개, 결과 화면 상위 10개
- **상위 3개 강조**: `.lb-top` 클래스로 스타일 차별화

출력 형식:
```
🏆 순위 시스템 현황

순위표 (통계 화면):
  - 위치: stats-screen > tab-leaderboard
  - 데이터: getResultsFiltered(period)
  - 필터: 전체(all) / 이번주(week) / 오늘(today)
  - 표시: 상위 10개, 상위 3개 강조
  - 표시 항목: 순위, 점수, 모드, 정답률, 날짜

순위 기록 (결과 화면):
  - 위치: result-screen > history-section
  - 데이터: getTopScores(10)
  - 표시 항목: 순위, 모드, 점수, 날짜
```

### 2. `improve` — 순위 시스템 개선 제안

현재 순위 시스템을 분석하여 개선할 수 있는 부분을 제안한다:

- **필터 확장**: 카테고리별 필터, 모드별 필터, 난이도별 필터 추가
- **정렬 옵션**: 점수 외에 정답률, 날짜순 정렬 지원
- **순위 변동**: 이전 기록 대비 순위 변동 표시 (UP/DOWN/NEW)
- **개인 최고 기록**: 신기록 달성 시 강조 표시
- **순위표 애니메이션**: 항목 등장 시 stagger 애니메이션
- **빈 상태 개선**: 필터별 맞춤 빈 상태 메시지

각 제안에 대해 다음을 포함한다:
- 구현 난이도: 쉬움/보통/어려움
- 수정 파일: game.js / style.css / index.html
- 코드 변경 규모: 예상 라인 수

사용자 승인 후에만 코드를 수정한다.

### 3. `fix` — 순위 시스템 버그 점검

순위 관련 코드를 점검하여 잠재적 버그를 찾는다:

- `getTopScores()`: 동일 점수 시 정렬 안정성 (날짜 우선 등)
- `getResultsFiltered()`: 기간 필터에서 timestamp가 0인 레거시 데이터 처리
- `renderLeaderboard()`: 결과가 없을 때 빈 상태 처리
- `renderHistory()`: section display 토글 정확성
- `filterLeaderboard()`: 버튼 active 상태 동기화
- 결과 화면과 통계 화면 간 데이터 일관성

발견된 문제에 대해:
```
### [BUG] <요약>
- 위치: <파일>:<라인>
- 현상: <설명>
- 원인: <분석>
- 수정안: <코드 변경 내용>
```

사용자 승인 후 수정을 적용한다.

### 4. `add-filter` — 새 필터 추가

순위표에 새로운 필터를 추가한다. 추가 인자로 필터 종류를 받는다:

- `category` — 카테고리별 필터 (한국사/과학/지리/예술과 문화)
- `mode` — 게임 모드별 필터 (전체 도전/카테고리별/스피드)
- `difficulty` — 난이도별 필터 (easy/medium/hard)

작업 절차:
1. index.html의 `#leaderboard-filter`에 필터 버튼 추가
2. game.js의 `filterLeaderboard()`와 `renderLeaderboard()`에 필터 로직 추가
3. 기존 기간 필터와 조합 가능하도록 구현 (AND 조건)
4. 사용자 승인 후 적용

## 주의사항

- `report`와 `fix`는 읽기 전용으로 시작한다. 파일 수정은 사용자 승인 후에만 한다.
- 기존 아키텍처(vanilla JS, 객체 리터럴 패턴, CSS 변수 기반 테마)를 유지한다.
- 다크모드 호환: 새로 추가하는 스타일은 `[data-theme="dark"]` 오버라이드도 함께 추가한다.
- localStorage 데이터를 직접 조작하지 마라 (브라우저 환경에서만 가능).
