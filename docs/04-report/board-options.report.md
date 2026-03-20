# board-options 완료 보고서

> **Summary**: 2048 게임에 보드 크기 선택(4×4/5×5) 및 Undo 기능을 추가한 기능 완료 보고서
>
> **Author**: Claude Code
> **Created**: 2026-03-20
> **Status**: Completed

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| **기능명** | board-options (보드 옵션) |
| **시작일** | 2026-03-20 |
| **완료일** | 2026-03-20 |
| **PDCA 단계** | Plan ✅ → Design ✅ → Do ✅ → Check ✅ → Act ✅ |
| **전체 상태** | 완료 |

---

## 2. PDCA 사이클 요약

### 2.1 Plan (계획)
**문서**: `docs/01-plan/features/board-options.plan.md`

**목표**:
- 보드 크기 선택 기능 (4×4 / 5×5)
- Undo 1단계 기능 추가

**요구사항** (F-11 ~ F-14):
- F-11: 보드 크기 선택 (4×4 / 5×5 중 선택)
- F-12: 크기별 게임 초기화
- F-13: Undo (1단계만 지원)
- F-14: Undo 버튼 UI + 비활성화

**예상 기간**: 1일

**상태**: 계획 승인됨

### 2.2 Design (설계)
**문서**: `docs/02-design/features/board-options.design.md`

**주요 설계 결정**:

| 항목 | 설계 방식 | 이유 |
|------|---------|------|
| 크기 선택 UX | 헤더 내 인라인 버튼 | 빠른 접근성 |
| 베스트 스코어 | 4×4/5×5 별도 저장 | 난이도 차이 반영 |
| Undo 단계 | 1단계만 지원 | 단순성 유지 |
| 셀 DOM | `rebuildCells()` 재생성 | 정확한 개수 보장 |

**설계 문서**: 10개 섹션, 구현 순서 10단계 명시

**상태**: 승인됨

### 2.3 Do (구현)
**구현 파일**:
- `index.html` — 초기 선택 화면, 게임 컨테이너
- `style.css` — 시작 화면 스타일, 동적 셀 크기 대응
- `game.js` — 상태 관리, 크기 변수화, Undo 함수

**구현 완료 항목**:
- ✅ 초기 선택 화면 (`#startScreen`) 구현
- ✅ `state.size`, `state.history` 상태 추가
- ✅ `initGame(size)` 파라미터화
- ✅ `getCellSize()`, `updateBoardCSS()` 반응형 지원
- ✅ `rebuildCells()` 동적 셀 생성
- ✅ `undo()` 함수 구현
- ✅ `move()` 함수에 history 저장 추가
- ✅ 크기별 `localStorage` 키 분리 (`2048-best-4`, `2048-best-5`)
- ✅ 이동/병합/게임 오버 로직 `state.size` 변수화
- ✅ 이벤트 리스너 연결 (startBtn4/5, newGame, undoBtn)

**실제 구현 기간**: 1일 (예상과 일치)

**상태**: 완료

### 2.4 Check (검증)
**문서**: `docs/03-analysis/board-options.analysis.md`

**검증 결과**:

| 카테고리 | 점수 | 상태 |
|---------|:----:|:-----:|
| HTML 구조 일치 | 38% | ⚠️ |
| CSS 스타일 일치 | 50% | ⚠️ |
| JS 로직 일치 | 75% | ⚠️ |
| **Plan 기능 충족 (F-11~F-14)** | **100%** | **✅** |
| 동작 규칙 충족 | **100%** | **✅** |
| **전체 Design Match Rate** | **72%** | **⚠️** |

**Gap 원인 분석**:

설계 문서는 헤더 내 인라인 버튼 방식으로 계획했으나, 실제 구현에서는 **초기 선택 화면** 방식으로 변경됨.

이는 사용자 피드백("따로 초기화면 만들어서 선택")을 반영한 **의도적 개선**으로, 기능 Gap이 아님.

**기능 Gap**: 0건 ✅

---

## 3. 요구사항 충족 현황

### Plan 기능 (F-11 ~ F-14)

| ID | 기능 | 계획 | 설계 | 구현 | 검증 | 상태 |
|----|------|:----:|:----:|:----:|:----:|:-----:|
| F-11 | 보드 크기 선택 | ✅ | ✅ | ✅ | ✅ | **✅ 완료** |
| F-12 | 크기별 게임 초기화 | ✅ | ✅ | ✅ | ✅ | **✅ 완료** |
| F-13 | Undo (1단계) | ✅ | ✅ | ✅ | ✅ | **✅ 완료** |
| F-14 | Undo 버튼 UI | ✅ | ✅ | ✅ | ✅ | **✅ 완료** |

**충족률**: 100% (4/4)

### 동작 규칙

| 규칙 | 설계 기준 | 구현 결과 | 상태 |
|------|----------|---------|:-----:|
| 크기 변경 시 게임 재시작 | 기존 진행 초기화 | 선택 화면으로 복귀 후 새 게임 시작 | ✅ |
| Undo 횟수 제한 | 1회만 | `state.history = null` 으로 1회 제한 | ✅ |
| Undo 후 연속 사용 불가 | history 비움 | 구현됨 | ✅ |
| 게임 오버/승리 후 Undo | 허용 | `state.over/won` 플래그 복원 | ✅ |
| 새 게임 시 history 초기화 | `state.history = null` | 구현됨 | ✅ |
| 베스트 스코어 별도 저장 | 4×4: `2048-best-4` / 5×5: `2048-best-5` | 구현됨 | ✅ |

**동작 규칙 충족률**: 100% (6/6)

---

## 4. 주요 구현 사항

### 4.1 초기 선택 화면 (설계 vs 구현)

**설계**: 헤더 내 인라인 버튼 (`#btn4x4`, `#btn5x5`)

**구현**: 별도 초기 선택 화면 (`#startScreen`)

```html
<!-- 게임 시작 전: startScreen 표시 -->
<div id="startScreen">
  <h1>2048</h1>
  <p>타일을 합쳐 2048을 만들어보세요!</p>
  <button id="startBtn4">4 × 4 (클래식)</button>
  <button id="startBtn5">5 × 5 (캐주얼)</button>
</div>

<!-- 게임 시작 후: gameContainer 표시 -->
<div id="gameContainer" class="hidden">...</div>
```

**개선 이유**: UX 명확성 — 게임 선택과 게임 플레이를 명확히 분리. 사용자 요청 반영.

### 4.2 상태 관리 (state)

```js
const state = {
  board:   [],
  score:   0,
  best:    0,
  over:    false,
  won:     false,
  size:    4,              // 추가: 현재 보드 크기 (4 또는 5)
  history: null,           // 추가: { board, score } | null
};
```

### 4.3 크기별 CSS 동적 설정

**반응형 지원** (`getCellSize()`)

| 보드 크기 | 데스크톱 (> 520px) | 모바일 (<= 520px) |
|----------|-------------------|-------------------|
| 4×4 | 100px | 70px |
| 5×5 | 76px | 54px |

```js
function getCellSize(size) {
  const vw = window.innerWidth;
  if (size === 4) return vw <= 520 ? 70 : 100;
  return vw <= 520 ? 54 : 76;
}
```

**5×5 센터링 수정**: `gameContainer.style.width = boardSize` 로 정렬 문제 해결

### 4.4 Undo 구현

```js
function undo() {
  if (!state.history) return;

  state.board = state.history.board;
  state.score = state.history.score;
  state.over  = false;
  state.won   = false;
  state.history = null;  // 1단계 후 비움

  render();
  updateScore();  // Undo 버튼 상태 업데이트
}
```

**move() 함수에서 history 저장**:

```js
function move(dir) {
  if (state.over || state.won) return;

  // 이동 전 현재 상태 저장
  const prevBoard = state.board.map(row => row.slice());
  const prevScore = state.score;

  // ... 이동 로직 ...

  // 실제로 이동이 일어난 경우만 저장
  if (/* 이동했음 */) {
    state.history = {
      board: prevBoard,
      score: prevScore,
    };
  }
}
```

### 4.5 베스트 스코어 분리 저장

```js
// 초기화 시
state.best = parseInt(localStorage.getItem(`2048-best-${s}`) || '0', 10);

// 점수 업데이트 시
if (state.score > state.best) {
  state.best = state.score;
  localStorage.setItem(`2048-best-${state.size}`, state.best);
}
```

---

## 5. 완료된 항목

### UI/UX
- ✅ 초기 선택 화면 구현 (4×4 "클래식", 5×5 "캐주얼" 선택지)
- ✅ Undo 버튼 추가 (비활성화 스타일 포함)
- ✅ New Game 버튼 → 선택 화면 복귀
- ✅ 반응형 디자인 (모바일 <= 520px 대응)

### 기능
- ✅ 보드 크기 선택 (4×4 / 5×5)
- ✅ 크기별 보드 재생성 (`rebuildCells()`)
- ✅ Undo 1단계 (state.history 관리)
- ✅ 게임 오버 후 Undo 복구 가능

### 기술
- ✅ `state.size`, `state.history` 상태 추가
- ✅ `getCellSize()` 반응형 지원
- ✅ `updateBoardCSS()` 동적 CSS 설정
- ✅ 모든 루프문 `state.size` 변수화 (addTile, slide, move, isGameOver, render)
- ✅ 베스트 스코어 키 분리 (`2048-best-4`, `2048-best-5`)
- ✅ 크기 변경 시 모든 상태 초기화

---

## 6. 미충족/보류 항목

**없음** — 모든 Plan 요구사항 F-11~F-14 충족

---

## 7. 설계 vs 구현 차이 및 개선 사항

### 7.1 UX 개선: 초기 선택 화면

**설계 계획**:
```
헤더에 크기 선택 버튼 [4×4] [5×5]
게임 중간에도 언제든 변경 가능
```

**실제 구현**:
```
게임 시작 전 별도 선택 화면
선택 후 게임 시작
New Game 클릭 시 다시 선택 화면
```

**평가**: ✅ **개선 판단**
- 사용자 요청 반영
- UX 명확성 향상 (게임 선택 → 게임 플레이 분리)
- 기능 Gap 없음

### 7.2 5×5 센터링 수정

**설계**: CSS 변수만으로 처리

**구현**: `gameContainer.style.width = boardSize` 추가

**평가**: ✅ **필요한 수정**
- 5×5 모드에서 보드가 정확히 중앙 정렬됨
- 사용자 피드백 반영

### 7.3 CSS 변수 처리

**설계**: `--board-cols` CSS 변수 사용

**구현**: `style.gridTemplateColumns`, `style.gridTemplateRows` 직접 설정

**평가**: ✅ **동등한 구현**
- 동적 계산이 필요하므로 JS 직접 설정이 더 유연
- 동작은 동일

---

## 8. 코드 품질 메트릭

| 메트릭 | 값 | 평가 |
|--------|-----|------|
| **Design Match Rate** | 72% | ⚠️ (UX 개선으로 인한 설계 차이) |
| **Plan 기능 충족** | 100% | ✅ |
| **동작 규칙 충족** | 100% | ✅ |
| **기능 Gap** | 0건 | ✅ |
| **코드 컨벤션** | 일관성 있음 | ✅ |
| **반응형 대응** | 2개 breakpoint | ✅ |

---

## 9. 이슈 및 해결 사항

### 이슈 1: 5×5 보드 센터링

**문제**: 5×5 모드에서 보드가 우측으로 치우침

**원인**: 헤더 너비가 보드 너비보다 큼

**해결**: `gameContainer.style.width = boardSize` 로 컨테이너 너비 제한

**상태**: ✅ 해결됨

### 이슈 2: Undo 후 게임 오버 상태 복구

**문제**: Undo 후 게임 오버 오버레이가 표시된 상태로 남음

**원인**: `state.over`, `state.won` 플래그 미복구

**해결**: `undo()` 함수에서 플래그 초기화 추가

```js
state.over = false;
state.won = false;
overlay.classList.add('hidden');
```

**상태**: ✅ 해결됨

### 이슈 3: History 저장 타이밍

**문제**: 이동이 없어도 history가 저장되어 빈 Undo 발생

**원인**: history를 조건 없이 저장

**해결**: `move()` 함수에서 실제 이동 여부 확인 후 저장

```js
if (JSON.stringify(state.board) !== prev) {
  state.history = { board: prevBoard, score: prevScore };
  // Undo 버튼 활성화
}
```

**상태**: ✅ 해결됨

---

## 10. 배운 점

### 성공 요인

1. **설계 문서의 구체성**: 10단계 구현 순서가 명확하여 구현이 체계적이었음
2. **사용자 요청 반영**: "초기 선택 화면" 요청을 수용하여 UX 개선
3. **상태 관리**: `state.size`, `state.history`를 명확하게 분리하여 복잡도 낮춤
4. **반응형 설계**: 초기 설계 단계에서 모바일 대응 고려

### 개선 영역

1. **설계 문서 동기화**: UX 변경사항을 설계 문서에 먼저 반영했으면 더 좋았을 것
2. **테스트 시나리오**: 엣지 케이스(게임 오버 후 Undo, 연속 Undo 시도 등) 사전 정의 필요
3. **History 저장 조건**: move() 함수에서 실제 이동 여부 확인 로직이 초기에는 누락됨

### 다음 번에 적용할 사항

1. **UX 변경은 설계 문서에 먼저 제안**: 코드 구현 전에 설계 문서 업데이트
2. **엣지 케이스 테스트 체크리스트 작성**: Plan/Design 단계에서 미리 정의
3. **상태 변경 흐름도 추가**: 복잡한 상태 관리는 다이어그램으로 표현
4. **localStorage 키 명명 규칙 문서화**: 향후 기능 추가 시 일관성 유지

---

## 11. 다음 단계

### 단기 (향후 기능)
- [ ] Redo 기능 추가 (Undo와 쌍으로)
- [ ] 여러 단계 Undo/Redo (state.history → history stack)
- [ ] Leaderboard (4×4 / 5×5 별도 랭킹)

### 중기
- [ ] 3×3, 6×6 보드 크기 옵션 확대
- [ ] 게임 설정 패널 (규칙 변경, 애니메이션 속도 등)
- [ ] 게임 진행 상태 localStorage 저장 (중단된 게임 복구)

### 기술 부채 정리
- [ ] `move()` 함수 리팩토링 (방향별 로직 추상화)
- [ ] CSS 변수 체계 재정리 (반응형 breakpoint 확대)
- [ ] 자동화 테스트 추가 (2048 로직 검증)

---

## 12. 관련 문서

| 문서 | 경로 | 상태 |
|------|------|:-----:|
| Plan | `docs/01-plan/features/board-options.plan.md` | ✅ Approved |
| Design | `docs/02-design/features/board-options.design.md` | ✅ Approved (UX 변경 반영 권장) |
| Analysis | `docs/03-analysis/board-options.analysis.md` | ✅ Complete |
| Implementation | `index.html`, `style.css`, `game.js` | ✅ Complete |

---

## 13. 결론

**board-options 기능은 모든 Plan 요구사항(F-11~F-14)을 100% 충족하며 완료되었습니다.**

- **기능 Gap**: 0건
- **동작 규칙 충족**: 100% (6/6)
- **사용자 피드백 반영**: ✅ (초기 선택 화면, 5×5 센터링)

Design Match Rate 72%는 **설계 vs 구현의 UX 개선 차이**로 인한 것이며, 기능적으로는 모든 요구사항을 만족합니다. 설계 문서를 현재 구현 기준으로 업데이트하면 일치도를 높일 수 있습니다.

**권장 사항**: 향후 기능 추가(Redo, 다단계 Undo) 시 설계 문서를 우선 업데이트한 후 구현하여 설계와 구현의 일치도를 유지할 것.

---

**보고서 작성 완료**: 2026-03-20
