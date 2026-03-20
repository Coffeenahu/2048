# Design: 보드 옵션 (Board Options)

## 메타 정보
- **Feature**: board-options
- **작성일**: 2026-03-20
- **최종 수정**: 2026-03-20 (구현 기준 동기화)
- **Phase**: Design (완료)
- **참조**: `docs/01-plan/features/board-options.plan.md`
- **변경 이력**: 초기 설계(헤더 인라인 버튼) → 구현 기준 업데이트(별도 초기 선택 화면)

---

## 1. UI 레이아웃

### 초기 선택 화면 (`#startScreen`)

```
┌─────────────────────────────────────┐
│                                     │
│              2048                   │
│    타일을 합쳐 2048을 만들어보세요!    │
│                                     │
│          보드 크기 선택              │
│                                     │
│   ┌──────────────┐ ┌─────────────┐  │
│   │     4 × 4    │ │    5 × 5   │  │
│   │   클래식      │ │   캐주얼    │  │
│   └──────────────┘ └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 게임 화면 (`#gameContainer`)

```
┌──────────────────────────────────────────┐
│  2048          SCORE    BEST             │
│                1024     2048             │
│                      [Undo] [New Game]   │
├──────────────────────────────────────────┤
│  (4×4 또는 5×5 보드)                      │
└──────────────────────────────────────────┘
```

- **New Game** 클릭 → 초기 선택 화면으로 복귀 (크기 재선택 가능)
- **Undo** — history 없으면 비활성화(`disabled`)

---

## 2. HTML 구조

```html
<body>

  <!-- 초기 선택 화면 -->
  <div id="startScreen">
    <div class="start-content">
      <h1>2048</h1>
      <p class="start-sub">타일을 합쳐 <strong>2048</strong>을 만들어보세요!</p>
      <p class="start-label">보드 크기 선택</p>
      <div class="start-btns">
        <button class="start-btn" id="startBtn4">
          <span class="btn-size">4 × 4</span>
          <span class="btn-desc">클래식</span>
        </button>
        <button class="start-btn" id="startBtn5">
          <span class="btn-size">5 × 5</span>
          <span class="btn-desc">캐주얼</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 게임 화면 -->
  <div class="container hidden" id="gameContainer">
    <header>
      <h1>2048</h1>
      <div class="header-right">
        <div class="scores">...</div>
        <div class="action-btns">
          <button id="undoBtn" disabled>Undo</button>
          <button id="newGame">New Game</button>
        </div>
      </div>
    </header>
    <div id="board"><!-- 셀은 JS 동적 생성 --></div>
    <div id="overlay" class="hidden">...</div>
  </div>

</body>
```

**설계 포인트:**
- 초기 로드 시 `#startScreen` 표시, `#gameContainer`는 `.hidden`
- 크기 선택 → `#startScreen` 숨김, `#gameContainer` 표시
- New Game → `#startScreen` 재표시 (크기 재선택 가능)
- 셀 DOM은 `rebuildCells(size)`로 매 initGame 시 재생성

---

## 3. CSS 설계

### 초기 선택 화면

```css
#startScreen {
  display: flex;
  align-items: center;
  justify-content: center;
}
#startScreen.hidden { display: none; }

.start-content { text-align: center; }
.start-content h1 { font-size: 80px; font-weight: 800; color: var(--text-dark); }
.start-sub { font-size: 16px; margin-bottom: 32px; }
.start-label { font-size: 14px; font-weight: 700; letter-spacing: 1px; opacity: 0.6; }

.start-btns { display: flex; gap: 16px; justify-content: center; }

.start-btn {
  background: #8f7a66;
  color: var(--text-light);
  border: none;
  border-radius: 10px;
  padding: 24px 40px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: background 0.15s, transform 0.1s;
}
.start-btn:hover { background: #9f8a76; transform: translateY(-2px); }

.btn-size { font-size: 28px; font-weight: 800; }
.btn-desc  { font-size: 13px; opacity: 0.85; }
```

### 게임 컨테이너

```css
.container { max-width: 100%; }
.container.hidden { display: none; }

/* 컨테이너 너비는 JS에서 동적 설정 */
/* gameContainer.style.width = `${boardSize}px` */
```

### Undo 버튼

```css
#undoBtn, #newGame {
  background: #8f7a66;
  color: var(--text-light);
  /* 기타 공통 버튼 스타일 */
}
#undoBtn:disabled {
  background: #cdc1b4;
  color: #a09080;
  cursor: not-allowed;
}
```

---

## 4. JavaScript 설계

### 상태 모델 확장

```js
const state = {
  board:   [],
  score:   0,
  best:    0,
  over:    false,
  won:     false,
  size:    4,       // 추가: 현재 보드 크기 (4 또는 5)
  history: null,    // 추가: { board, score } | null (1단계 Undo용)
};

// 베스트 스코어 키: '2048-best-4', '2048-best-5' (크기별 분리)
```

### 함수 구조

```
game.js
├── 화면 전환
│   ├── showStartScreen()     초기 선택 화면 표시, 게임 숨김
│   └── startGame(size)       선택 화면 숨김, initGame 호출
│
├── 상태 관리
│   ├── initGame(size)        size 파라미터, history 초기화, best 키 분리
│   ├── updateBoardCSS(size)  CSS 변수 + 보드/컨테이너 크기 동적 설정
│   ├── rebuildCells(size)    셀 DOM size² 개 재생성
│   └── getCellSize(size)     뷰포트 기반 셀 px 반환
│
├── 게임 로직 (size 변수화)
│   ├── addTile()             state.size 사용
│   ├── slide(row)            state.size 기준 패딩
│   ├── move(dir)             state.size 기준 루프 + history 저장
│   └── isGameOver()          state.size 기준 체크
│
├── Undo
│   └── undo()                history 복원, null 초기화, overlay 숨김
│
└── UI 갱신
    ├── render()              state.size 기준 렌더링
    └── updateScore()         undoBtn.disabled 상태 갱신
```

### 핵심 함수 상세

#### `updateBoardCSS(size)`

```js
function updateBoardCSS(size) {
  const cellSize  = getCellSize(size);       // 뷰포트 기반
  const gap       = size === 4 ? 12 : 10;
  const boardSize = size * cellSize + (size + 1) * gap;

  document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
  document.documentElement.style.setProperty('--gap', `${gap}px`);

  boardEl.style.width               = `${boardSize}px`;
  boardEl.style.height              = `${boardSize}px`;
  boardEl.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
  boardEl.style.gridTemplateRows    = `repeat(${size}, ${cellSize}px)`;

  gameContainer.style.width = `${boardSize}px`;  // 센터링 보정
}
```

#### `getCellSize(size)`

| 보드 크기 | 기본 (> 520px) | 모바일 (≤ 520px) |
|----------|---------------|----------------|
| 4×4 | 100px | 70px |
| 5×5 | 76px | 54px |

#### `undo()`

```js
function undo() {
  if (!state.history) return;

  state.board   = state.history.board;
  state.score   = state.history.score;
  state.over    = false;
  state.won     = false;
  state.history = null;   // 1회 후 비움 (연속 Undo 불가)

  overlay.classList.add('hidden');
  render();
  updateScore();   // undoBtn 비활성화 포함
}
```

#### `move(dir)` — history 저장 조건

```js
// 이동 발생 전 임시 저장
const prevBoard = state.board.map(row => row.slice());
const prevScore = state.score;

// ...이동 로직...

// 실제 이동이 발생했을 때만 history 확정 저장
if (!moved) return;
state.history = { board: prevBoard, score: prevScore };
```

### 이벤트 연결

```js
document.getElementById('startBtn4').addEventListener('click', () => startGame(4));
document.getElementById('startBtn5').addEventListener('click', () => startGame(5));
document.getElementById('newGame').addEventListener('click', showStartScreen);
document.getElementById('tryAgain').addEventListener('click', () => initGame(state.size));
document.getElementById('undoBtn').addEventListener('click', undo);
window.addEventListener('resize', () => updateBoardCSS(state.size));
```

---

## 5. 설계 결정 사항

| 결정 | 선택 | 이유 |
|------|------|------|
| 크기 선택 UX | **별도 초기 선택 화면** | 인라인 버튼보다 명확한 선택 경험, 실수 방지 |
| New Game 동작 | 초기 화면으로 복귀 | 크기 재선택 기회 제공 |
| Undo 단계 | 1단계만 | 게임 밸런스, 단순성 유지 |
| history 저장 시점 | 이동 실제 발생 시에만 | 불필요한 저장 방지 |
| 베스트 스코어 | 크기별 별도 key | 4×4와 5×5 난이도 차이 반영 |
| 컨테이너 너비 | JS에서 동적 설정 | CSS 변수 하드코딩(4열 기준) 의존 제거, 5×5 센터링 보장 |
| 셀 DOM | `rebuildCells()` 재생성 | 크기 변경 시 정확한 셀 수 보장 |
