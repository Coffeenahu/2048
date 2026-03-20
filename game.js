'use strict';

// ── 상태 ──────────────────────────────────────────────────────────────────────
const state = {
  board:   [],
  score:   0,
  best:    0,
  over:    false,
  won:     false,
  size:    4,
  history: null,   // { board, score } | null
};

// ── DOM 참조 ──────────────────────────────────────────────────────────────────
const boardEl        = document.getElementById('board');
const scoreEl        = document.getElementById('score');
const bestEl         = document.getElementById('best');
const overlay        = document.getElementById('overlay');
const overlayTitle   = document.getElementById('overlayTitle');
const finalScore     = document.getElementById('finalScore');
const undoBtn        = document.getElementById('undoBtn');
const startScreen    = document.getElementById('startScreen');
const gameContainer  = document.getElementById('gameContainer');

document.getElementById('startBtn4').addEventListener('click', () => startGame(4));
document.getElementById('startBtn5').addEventListener('click', () => startGame(5));
document.getElementById('newGame').addEventListener('click', showStartScreen);
document.getElementById('tryAgain').addEventListener('click', () => initGame(state.size));
undoBtn.addEventListener('click', undo);

// ── 시작 화면 ─────────────────────────────────────────────────────────────────
function showStartScreen() {
  startScreen.classList.remove('hidden');
  gameContainer.classList.add('hidden');
  overlay.classList.add('hidden');
}

function startGame(size) {
  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  initGame(size);
}

// ── 초기화 ────────────────────────────────────────────────────────────────────
function initGame(size) {
  const s       = size || 4;
  state.size    = s;
  state.board   = Array.from({ length: s }, () => Array(s).fill(0));
  state.score   = 0;
  state.over    = false;
  state.won     = false;
  state.history = null;
  state.best    = parseInt(localStorage.getItem(`2048-best-${s}`) || '0', 10);

  updateBoardCSS(s);
  rebuildCells(s);
  overlay.classList.add('hidden');
  addTile();
  addTile();
  render();
  updateScore();
}

// ── CSS / DOM 보드 업데이트 ───────────────────────────────────────────────────
function getCellSize(size) {
  const vw = window.innerWidth;
  if (size === 4) return vw <= 520 ? 70 : 100;
  return vw <= 520 ? 54 : 76;
}

function updateBoardCSS(size) {
  const cellSize  = getCellSize(size);
  const gap       = size === 4 ? 12 : 10;
  const boardSize = size * cellSize + (size + 1) * gap;

  document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
  document.documentElement.style.setProperty('--gap', `${gap}px`);

  boardEl.style.width                = `${boardSize}px`;
  boardEl.style.height               = `${boardSize}px`;
  boardEl.style.gridTemplateColumns  = `repeat(${size}, ${cellSize}px)`;
  boardEl.style.gridTemplateRows     = `repeat(${size}, ${cellSize}px)`;

  // 컨테이너 너비를 보드 크기에 맞춤 (센터링 보정)
  gameContainer.style.width = `${boardSize}px`;
}

function rebuildCells(size) {
  boardEl.querySelectorAll('.cell').forEach(el => el.remove());
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardEl.appendChild(cell);
  }
}

// ── 타일 추가 ─────────────────────────────────────────────────────────────────
function addTile() {
  const empty = [];
  for (let r = 0; r < state.size; r++)
    for (let c = 0; c < state.size; c++)
      if (state.board[r][c] === 0) empty.push([r, c]);

  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  state.board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return [r, c];
}

// ── 핵심 알고리즘: 한 줄 슬라이드 (왼쪽 방향) ────────────────────────────────
function slide(row) {
  let tiles = row.filter(v => v !== 0);
  let added = 0;
  const merged = new Array(tiles.length).fill(false);

  for (let i = 0; i < tiles.length - 1; i++) {
    if (!merged[i] && tiles[i] === tiles[i + 1]) {
      tiles[i] *= 2;
      added += tiles[i];
      tiles.splice(i + 1, 1);
      merged.splice(i + 1, 1);
      merged[i] = true;
    }
  }

  while (tiles.length < state.size) tiles.push(0);
  return { result: tiles, addedScore: added };
}

// ── 방향별 이동 ───────────────────────────────────────────────────────────────
function move(dir) {
  if (state.over || state.won) return;

  // 이동 전 상태 저장 (Undo용)
  const prevBoard = state.board.map(row => row.slice());
  const prevScore = state.score;

  const prev = JSON.stringify(state.board);
  let totalAdded = 0;
  const mergedPositions = new Set();
  const N = state.size;

  for (let i = 0; i < N; i++) {
    let line;

    if (dir === 'left') {
      line = state.board[i].slice();
    } else if (dir === 'right') {
      line = state.board[i].slice().reverse();
    } else if (dir === 'up') {
      line = Array.from({ length: N }, (_, r) => state.board[r][i]);
    } else {
      line = Array.from({ length: N }, (_, r) => state.board[N - 1 - r][i]);
    }

    const { result, addedScore } = slide(line);
    totalAdded += addedScore;

    if (dir === 'left') {
      state.board[i] = result;
      result.forEach((v, c) => { if (v > 0 && addedScore > 0) mergedPositions.add(`${i},${c}`); });
    } else if (dir === 'right') {
      state.board[i] = result.reverse();
      state.board[i].forEach((v, c) => { if (v > 0 && addedScore > 0) mergedPositions.add(`${i},${c}`); });
    } else if (dir === 'up') {
      result.forEach((v, r) => {
        state.board[r][i] = v;
        if (v > 0 && addedScore > 0) mergedPositions.add(`${r},${i}`);
      });
    } else {
      result.forEach((v, idx) => {
        state.board[N - 1 - idx][i] = v;
        if (v > 0 && addedScore > 0) mergedPositions.add(`${N - 1 - idx},${i}`);
      });
    }
  }

  const moved = JSON.stringify(state.board) !== prev;
  if (!moved) return;

  // 이동이 실제로 발생한 경우에만 history 저장
  state.history = { board: prevBoard, score: prevScore };

  state.score += totalAdded;
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(`2048-best-${state.size}`, state.best);
  }

  // 2048 승리 감지
  const hasWon = state.board.some(row => row.includes(2048));
  if (hasWon && !state.won) {
    state.won = true;
    const newPos = addTile();
    render(newPos, totalAdded, mergedPositions);
    updateScore();
    setTimeout(() => showOverlay('You Win!'), 300);
    return;
  }

  const newPos = addTile();
  render(newPos, totalAdded, mergedPositions);
  updateScore();

  if (isGameOver()) {
    state.over = true;
    setTimeout(() => showOverlay('Game Over!'), 300);
  }
}

// ── Undo ──────────────────────────────────────────────────────────────────────
function undo() {
  if (!state.history) return;

  state.board   = state.history.board;
  state.score   = state.history.score;
  state.over    = false;
  state.won     = false;
  state.history = null;

  overlay.classList.add('hidden');
  render();
  updateScore();
}

// ── 게임 오버 판별 ────────────────────────────────────────────────────────────
function isGameOver() {
  const N = state.size;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (state.board[r][c] === 0) return false;
      if (c < N - 1 && state.board[r][c] === state.board[r][c + 1]) return false;
      if (r < N - 1 && state.board[r][c] === state.board[r + 1][c]) return false;
    }
  return true;
}

// ── 렌더링 ────────────────────────────────────────────────────────────────────
function render(newPos, addedScore, mergedPositions) {
  boardEl.querySelectorAll('.tile').forEach(el => el.remove());

  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      const val = state.board[r][c];
      if (val === 0) continue;

      const tile = document.createElement('div');
      const cls  = val <= 2048 ? `tile-${val}` : 'tile-super';
      tile.className = `tile ${cls}`;
      tile.style.setProperty('--r', r);
      tile.style.setProperty('--c', c);
      tile.textContent = val;

      if (newPos && newPos[0] === r && newPos[1] === c) {
        tile.classList.add('tile-new');
      } else if (mergedPositions && mergedPositions.has(`${r},${c}`)) {
        tile.classList.add('tile-merged');
      }

      boardEl.appendChild(tile);
    }
  }

  if (addedScore > 0) {
    const pop = document.createElement('div');
    pop.className = 'score-add';
    pop.textContent = `+${addedScore}`;
    boardEl.appendChild(pop);
    pop.addEventListener('animationend', () => pop.remove());
  }
}

// ── 점수 + Undo 버튼 상태 갱신 ────────────────────────────────────────────────
function updateScore() {
  scoreEl.textContent    = state.score;
  bestEl.textContent     = state.best;
  undoBtn.disabled       = !state.history;
}

// ── 오버레이 표시 ─────────────────────────────────────────────────────────────
function showOverlay(title) {
  overlayTitle.textContent = title;
  finalScore.textContent   = state.score;
  overlay.classList.remove('hidden');
}

// ── 키보드 이벤트 ─────────────────────────────────────────────────────────────
const KEY_MAP = {
  ArrowLeft:  'left',
  ArrowRight: 'right',
  ArrowUp:    'up',
  ArrowDown:  'down',
};

document.addEventListener('keydown', e => {
  const dir = KEY_MAP[e.key];
  if (!dir) return;
  e.preventDefault();
  move(dir);
});

// ── 터치/스와이프 이벤트 ──────────────────────────────────────────────────────
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30;

boardEl.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

boardEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
}, { passive: true });

// ── 화면 크기 변경 시 보드 CSS 재계산 ────────────────────────────────────────
window.addEventListener('resize', () => updateBoardCSS(state.size));

// ── 시작 ──────────────────────────────────────────────────────────────────────
showStartScreen();
