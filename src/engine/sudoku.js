export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isValid(board, row, col, num) {
  if (board[row].includes(num)) return false;
  if (board.some((r) => r[col] === num)) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (board[r][c] === num) return false;
  return true;
}

function findEmpty(board) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) return [r, c];
  return null;
}

function fillBoard(board) {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [r, c] = empty;
  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValid(board, r, c, n)) {
      board[r][c] = n;
      if (fillBoard(board)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}

export function createPuzzle(difficulty) {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(solution);
  const puzzle = solution.map((r) => [...r]);
  const clues = { easy: 40, medium: 32, hard: 26, expert: 22 }[difficulty] ?? 32;
  let toRemove = 81 - clues;
  const cells = shuffle([...Array(81).keys()]);
  for (const idx of cells) {
    if (toRemove === 0) break;
    const r = Math.floor(idx / 9), c = idx % 9;
    if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; toRemove--; }
  }
  return { puzzle, solution };
}
