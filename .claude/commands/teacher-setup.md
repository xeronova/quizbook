선생님 모드 초기 설정을 수행하라. 아래 단계를 **순서대로** 실행하며, 각 단계가 성공해야 다음 단계로 진행한다. 실패 시 즉시 중단하고 오류를 보고한다.

## 목적

학생별 퀴즈 결과를 수집·분석하기 위한 선생님 모드 환경을 구성한다.

## 실행 절차

---

### 1단계: 디렉토리 구조 생성

다음 디렉토리를 생성한다 (이미 존재하면 스킵):

```
data/
├── students/       # 학생별 JSON 파일 저장
└── reports/        # 분석 보고서 저장
```

```bash
mkdir -p data/students data/reports
```

**성공 조건**: `data/students/`와 `data/reports/` 디렉토리가 존재
**실패 시**: "❌ 1단계 실패: 디렉토리 생성 불가 — <구체적 원인>" 출력 후 중단

---

### 2단계: 학생 명부 초기화

`data/roster.json` 파일을 생성한다. 이미 존재하면 스킵하고 현재 내용을 보고한다.

초기 형식:

```json
{
  "version": 1,
  "created": "<ISO 날짜>",
  "updated": "<ISO 날짜>",
  "students": []
}
```

학생 항목 형식 (참고용, 이 단계에서는 빈 배열):

```json
{
  "name": "<학생 이름>",
  "addedAt": "<ISO 날짜>",
  "lastImport": "<ISO 날짜>",
  "totalImports": 0
}
```

**성공 조건**: `data/roster.json`이 존재하고 유효한 JSON
**실패 시**: "❌ 2단계 실패: roster.json 생성 실패" 출력 후 중단

---

### 3단계: 학생 이름 입력 기능 추가 (game.js)

game.js에 학생 이름 입력 및 결과 내보내기 기능을 추가한다.

**추가할 코드:**

1. **`StudentExporter` 객체** — `LocalDataManager` 아래에 추가:

```js
const StudentExporter = {
  getStudentName() {
    return localStorage.getItem('quizbook_student_name') || '';
  },

  setStudentName(name) {
    localStorage.setItem('quizbook_student_name', name.trim());
  },

  exportData() {
    const name = this.getStudentName();
    if (!name) {
      alert('학생 이름을 먼저 입력해주세요.');
      return;
    }
    const data = LocalDataManager._load();
    data.studentName = name;
    data.exportedAt = new Date().toISOString();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_quizbook.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
```

2. **시작 화면에 이름 입력/내보내기 초기화** — `initApp()` 또는 DOMContentLoaded 핸들러 내부에 추가:

```js
// 학생 이름 입력 초기화
const studentNameInput = $('student-name-input');
if (studentNameInput) {
  studentNameInput.value = StudentExporter.getStudentName();
  studentNameInput.addEventListener('change', (e) => {
    StudentExporter.setStudentName(e.target.value);
  });
}

// 내보내기 버튼
const exportBtn = $('export-data-btn');
if (exportBtn) {
  exportBtn.addEventListener('click', () => StudentExporter.exportData());
}
```

**주의**: 기존 코드의 스타일(들여쓰기 2칸, 세미콜론 사용 등)을 그대로 따른다. 사용자 승인 후에만 파일을 수정한다.

**성공 조건**: `StudentExporter` 객체와 이벤트 리스너가 game.js에 추가됨
**실패 시**: "❌ 3단계 실패: game.js 수정 실패 — <구체적 원인>" 출력 후 중단

---

### 4단계: 내보내기 UI 추가 (index.html)

index.html의 시작 화면(`#start-screen`)에 학생 이름 입력 필드와 내보내기 버튼을 추가한다.

**추가할 HTML** (시작 화면 하단, 시작 버튼 아래):

```html
<div class="student-export-section">
  <h3>📋 선생님 모드</h3>
  <div class="student-name-group">
    <label for="student-name-input">학생 이름</label>
    <input type="text" id="student-name-input" placeholder="이름을 입력하세요" maxlength="20">
  </div>
  <button id="export-data-btn" class="btn btn-secondary">📤 결과 내보내기</button>
  <p class="export-hint">선생님에게 제출할 JSON 파일을 다운로드합니다</p>
</div>
```

**추가할 CSS** (style.css):

```css
.student-export-section {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 2px dashed var(--border-color, #ddd);
  border-radius: 12px;
  text-align: center;
}

.student-export-section h3 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.student-name-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.student-name-group label {
  font-size: 0.9rem;
  font-weight: 600;
}

.student-name-group input {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
}

.export-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted, #888);
}
```

다크모드 오버라이드도 함께 추가한다:

```css
[data-theme="dark"] .student-name-group input {
  border-color: var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
}
```

**주의**: 사용자 승인 후에만 파일을 수정한다.

**성공 조건**: 시작 화면에 학생 이름 입력과 내보내기 버튼이 표시됨
**실패 시**: "❌ 4단계 실패: index.html 수정 실패 — <구체적 원인>" 출력 후 중단

---

### 5단계: 설정 완료 보고

전체 설정 결과를 보고한다:

```
✅ 선생님 모드 초기 설정 완료

📁 생성된 디렉토리:
  - data/students/    (학생별 JSON 저장소)
  - data/reports/     (분석 보고서 저장소)

📋 생성된 파일:
  - data/roster.json  (학생 명부)

🔧 수정된 파일:
  - js/game.js        (StudentExporter 객체 추가)
  - index.html        (학생 이름 입력 + 내보내기 버튼)
  - css/style.css     (내보내기 섹션 스타일)

📌 다음 단계:
  1. 학생이 브라우저에서 퀴즈를 풀고 이름을 입력
  2. "결과 내보내기" 버튼으로 JSON 파일 다운로드
  3. /teacher-import 명령어로 학생 데이터를 가져오기
```

---

## 오류 처리 정책

- 1~4단계 실패: 즉시 중단, 오류 보고
- 이미 설정이 완료된 상태면 각 단계에서 "이미 존재함"을 보고하고 스킵
- 사용자 승인 없이 기존 파일을 수정하지 마라

## 주의사항

- 기존 코드의 스타일(vanilla JS, 객체 리터럴 패턴, CSS 변수 기반 테마)을 유지한다.
- `data/` 디렉토리가 .gitignore에 포함되어야 하는지 사용자에게 확인한다.
- 내보내기 기능은 브라우저 환경에서만 동작한다 (파일 다운로드 API 사용).
