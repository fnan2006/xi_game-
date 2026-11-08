const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let board, current, running, mode, scores;

const $ = id => document.getElementById(id);
const boardEl = $('board');
const turnEl = $('turn');
const modal = $('modal');

function init() {
  board = Array(9).fill(null);
  current = 'X';
  running = true;
  scores = scores || { X: 0, O: 0, draw: 0 };
  mode = mode || 'pvp';
  render();
  updateTurn();
  updateScores();
  modal.classList.remove('show');
}

function render() {
  boardEl.innerHTML = '';
  board.forEach((val, i) => {
    const cell = document.createElement('button');
    cell.className = 'cell';
    if (val) {
      cell.classList.add('filled', val.toLowerCase());
      cell.textContent = val === 'X' ? '❌' : '⭕';
    }
    cell.onclick = () => play(i);
    boardEl.appendChild(cell);
  });
}

function play(i) {
  if (!running || board[i]) return;
  if (mode === 'ai' && current === 'O') return;

  makeMove(i);
  if (mode === 'ai' && running && current === 'O') {
    setTimeout(aiMove, 400);
  }
}

function makeMove(i) {
  if (!running || board[i]) return;

  board[i] = current;
  if (navigator.vibrate) navigator.vibrate(30);

  const result = checkWinner(board);

  if (result) {
    running = false;
    if (result.winner === 'draw') {
      scores.draw++;
      showModal('🤝', 'تعادل!');
    } else {
      scores[result.winner]++;
      showModal(result.winner === 'X' ? '🎉' : '🤖', `${result.winner} فاز!`);
      result.line.forEach(idx => {
        boardEl.children[idx].classList.add('win');
      });
    }
    updateScores();
    render();
    return;
  }

  current = current === 'X' ? 'O' : 'X';
  render();
  updateTurn();
}

function aiMove() {
  if (!running) return;
  const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
  if (!empty.length) return;

  const best = minimax([...board], false, 'O', 'X');
  makeMove(best.index);
}

function minimax(b, isMax, ai, human) {
  const res = checkWinner(b);
  if (res) {
    if (res.winner === ai) return { score: 10 };
    if (res.winner === human) return { score: -10 };
    if (res.winner === 'draw') return { score: 0 };
  }

  let best = { score: isMax ? -Infinity : Infinity, index: -1 };

  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = isMax ? ai : human;
      const r = minimax(b, !isMax, ai, human);
      b[i] = null;

      if (isMax ? r.score > best.score : r.score < best.score) {
        best = { score: r.score, index: i };
      }
    }
  }
  return best;
}

function checkWinner(b) {
  for (const line of WINS) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], line };
    }
  }
  if (b.every(v => v)) return { winner: 'draw' };
  return null;
}

function updateTurn() {
  turnEl.innerHTML = `دور <b style="color:${current === 'X' ? 'var(--x)' : 'var(--o)'}">${current}</b>`;
}

function updateScores() {
  $('scoreX').textContent = scores.X;
  $('scoreO').textContent = scores.O;
  $('scoreDraw').textContent = scores.draw;
}

function showModal(icon, text) {
  $('modalIcon').textContent = icon;
  $('modalText').textContent = text;
  setTimeout(() => modal.classList.add('show'), 500);
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

$('modalClose').onclick = init;
$('reset').onclick = init;

$('modePvP').onclick = () => {
  mode = 'pvp';
  $('modePvP').classList.add('active');
  $('modeAI').classList.remove('active');
  init();
};

$('modeAI').onclick = () => {
  mode = 'ai';
  $('modeAI').classList.add('active');
  $('modePvP').classList.remove('active');
  init();
};

init();