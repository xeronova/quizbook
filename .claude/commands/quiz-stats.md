퀴즈 게임의 통계 시스템을 분석하고 관리하라.

## 대상 파일

- js/game.js — `LocalDataManager`, `renderDashboard()`, `renderCategoryAccuracy()`, `renderGrowthChart()`, 통계 화면 관련 함수들
- css/style.css — `.dashboard-summary`, `.dash-item`, `.cat-accuracy-item`, `.growth-chart` 등 통계 UI 스타일
- index.html — `#stats-screen`, `#tab-dashboard`, `#tab-growth` 등 통계 화면 HTML

## 기능

$ARGUMENTS 에 따라 아래 기능 중 하나를 실행한다. 인자가 없으면 사용자에게 물어본다.

### 1. `report` — 통계 시스템 현황 보고

현재 통계 시스템의 구현 상태를 분석하고 보고한다:

- **데이터 구조**: `LocalDataManager`의 `quizbook_data` 스키마 분석
  - `stats` 필드: totalGames, totalCorrect, totalQuestions
  - `results` 배열: 각 결과 객체의 필드 목록
  - `settings` 필드: darkMode, soundEnabled
- **대시보드 기능**: renderDashboard()가 표시하는 항목 나열
- **카테고리 통계**: getCategoryStats() 동작 방식
- **성장 그래프**: renderGrowthChart()의 SVG 렌더링 방식
- **데이터 한도**: 최대 저장 결과 수 (MAX_RESULTS), 레거시 동기화 여부

출력 형식:
```
📊 통계 시스템 현황

데이터 저장소: localStorage (key: quizbook_data)
스키마 버전: 2
최대 기록: 100개
레거시 호환: quizbook_history 동기화

대시보드 항목:
  - 총 플레이 수
  - 최고 점수
  - 평균 정답률
  - 총 정답 수
  - 카테고리별 정답률 바

성장 그래프: SVG polyline (최근 20게임)
  - 점수 라인 (실선)
  - 정답률 라인 (점선)
```

### 2. `improve` — 통계 기능 개선 제안

현재 통계 시스템을 분석하여 개선할 수 있는 부분을 제안한다:

- 누락된 통계 항목 (예: 평균 응답시간 추이, 난이도별 정답률, 모드별 비교)
- UI/UX 개선점 (예: 빈 상태 처리, 애니메이션, 툴팁)
- 데이터 활용도 (저장은 하지만 표시하지 않는 필드)
- 성능 이슈 (불필요한 _load() 반복 호출 등)

각 제안에 대해 구현 난이도(쉬움/보통/어려움)와 영향도(높음/중간/낮음)를 표시한다.
사용자 승인 후에만 코드를 수정한다.

### 3. `fix` — 통계 버그 점검 및 수정

통계 관련 코드를 점검하여 잠재적 버그를 찾는다:

- `_load()` / `_save()` 에서의 에러 핸들링
- `stats` 누적 카운터 정합성 (results 배열 합계와 일치하는지)
- `renderGrowthChart()` 엣지 케이스 (0점 게임, 동일 점수 반복 등)
- `getResultsFiltered()` 기간 필터 정확성
- `_migrate()` 레거시 데이터 변환 누락 필드
- SVG 렌더링에서의 NaN/Infinity 가능성

발견된 문제에 대해 수정안을 제시하고 사용자 승인 후 적용한다.

### 4. `reset` — 통계 초기화 가이드

통계 데이터를 초기화하는 방법을 안내한다 (직접 실행하지 않음):

```
⚠️ 통계 초기화 방법

브라우저 개발자 도구 콘솔에서:

// 전체 초기화
localStorage.removeItem('quizbook_data');
localStorage.removeItem('quizbook_history');

// 통계만 초기화 (기록은 유지)
// → LocalDataManager에 resetStats() 메서드 추가 필요
```

resetStats() 메서드가 없다면 추가를 제안한다.

## 주의사항

- `report`와 `fix`는 읽기 전용으로 시작한다. 파일 수정은 사용자 승인 후에만 한다.
- `improve` 제안은 기존 아키텍처(vanilla JS, 객체 리터럴 패턴)를 유지하는 범위에서 한다.
- localStorage 데이터를 직접 조작하지 마라 (브라우저 환경에서만 가능).
