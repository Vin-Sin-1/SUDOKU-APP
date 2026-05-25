import { isValid } from './sudoku.js';

export function getConflicts(board) {
  const conflicts = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (!v) continue;
      for (let cc = 0; cc < 9; cc++)
        if (cc !== c && board[r][cc] === v) { conflicts.add(`${r}-${c}`); conflicts.add(`${r}-${cc}`); }
      for (let rr = 0; rr < 9; rr++)
        if (rr !== r && board[rr][c] === v) { conflicts.add(`${r}-${c}`); conflicts.add(`${rr}-${c}`); }
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let rr = br; rr < br + 3; rr++)
        for (let cc = bc; cc < bc + 3; cc++)
          if ((rr !== r || cc !== c) && board[rr][cc] === v) {
            conflicts.add(`${r}-${c}`); conflicts.add(`${rr}-${cc}`);
          }
    }
  }
  return conflicts;
}

export function calcCandidates(board) {
  const notes = {};
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const candidates = new Set();
      for (let n = 1; n <= 9; n++)
        if (isValid(board, r, c, n)) candidates.add(n);
      notes[`${r}-${c}`] = candidates;
    }
  return notes;
}
