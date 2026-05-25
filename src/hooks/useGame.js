import { useState, useEffect, useCallback, useRef } from 'react';
import { createPuzzle } from '../engine/sudoku.js';
import { getConflicts, calcCandidates } from '../engine/candidates.js';
import { calcScore } from '../engine/scoring.js';
import { getRandomMessage } from '../constants/messages.js';
import { useTimer } from './useTimer.js';

function getCompletedRows(board, solution) {
  const done = new Set();
  for (let r = 0; r < 9; r++)
    if (board[r].every((v, c) => v !== 0 && v === solution[r][c])) done.add(`r${r}`);
  return done;
}

function getCompletedCols(board, solution) {
  const done = new Set();
  for (let c = 0; c < 9; c++)
    if (board.every((row, r) => row[c] !== 0 && row[c] === solution[r][c])) done.add(`c${c}`);
  return done;
}

function getCompletedBoxes(board, solution) {
  const done = new Set();
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let complete = true;
      for (let r = br * 3; r < br * 3 + 3; r++)
        for (let c = bc * 3; c < bc * 3 + 3; c++)
          if (board[r][c] === 0 || board[r][c] !== solution[r][c]) { complete = false; break; }
      if (complete) done.add(`b${br}${bc}`);
    }
  }
  return done;
}

export function useGame() {
  const [difficulty, setDifficulty]     = useState('expert');
  const [given, setGiven]               = useState(null);
  const [board, setBoard]               = useState(null);
  const [solution, setSolution]         = useState(null);
  const [selected, setSelected]         = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [won, setWon]                   = useState(false);
  const [paused, setPaused]             = useState(false);
  const [pencilMode, setPencilMode]     = useState(false);
  const [pencilNum, setPencilNum]       = useState(null);
  const [notes, setNotes]               = useState({});
  const [history, setHistory]           = useState([]);
  const [streak, setStreak]             = useState(0);
  const [autoRemove, setAutoRemove]     = useState(true);
  const [score, setScore]               = useState(0);
  const [showDiffMenu, setShowDiffMenu] = useState(false);
  const [fastPencilOn, setFastPencilOn] = useState(false);
  const [preAutoNotes, setPreAutoNotes] = useState(null);
  const [lastAction, setLastAction]     = useState(null);
  const [toast, setToast]               = useState(null);
  const toastTimer = useRef(null);

  const timerRunning = !!(board && !won && !paused);
  const { seconds, reset: resetTimer } = useTimer(timerRunning);

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  function checkCompletions(newBoard, sol, prevBoard) {
    const prevRows  = getCompletedRows(prevBoard, sol);
    const prevCols  = getCompletedCols(prevBoard, sol);
    const prevBoxes = getCompletedBoxes(prevBoard, sol);
    const newRows   = getCompletedRows(newBoard, sol);
    const newCols   = getCompletedCols(newBoard, sol);
    const newBoxes  = getCompletedBoxes(newBoard, sol);

    const newlyBox = [...newBoxes].filter((k) => !prevBoxes.has(k));
    const newlyRow = [...newRows].filter((k) => !prevRows.has(k));
    const newlyCol = [...newCols].filter((k) => !prevCols.has(k));

    if (newlyBox.length)      showToast(getRandomMessage('box'));
    else if (newlyRow.length) showToast(getRandomMessage('row'));
    else if (newlyCol.length) showToast(getRandomMessage('col'));
  }

  const startGame = useCallback((diff = difficulty) => {
    const { puzzle, solution: sol } = createPuzzle(diff);
    setGiven(puzzle.map((r) => r.map((v) => v !== 0)));
    setBoard(puzzle.map((r) => [...r]));
    setSolution(sol);
    setSelected(null);
    setMistakeCount(0);
    setWon(false);
    setPaused(false);
    setNotes({});
    setPencilNum(null);
    setHistory([]);
    setScore(0);
    setFastPencilOn(false);
    setPreAutoNotes(null);
    setLastAction(null);
    setToast(null);
    resetTimer();
  }, [difficulty, resetTimer]);

  useEffect(() => { startGame(); }, []);

  const conflicts   = board ? getConflicts(board) : new Set();
  const selectedVal = selected && board ? board[selected[0]][selected[1]] : 0;

  const remaining = {};
  for (let n = 1; n <= 9; n++) {
    let count = 0;
    if (board) board.forEach((row) => row.forEach((v) => { if (v === n) count++; }));
    remaining[n] = 9 - count;
  }

  function isHighlighted(r, c) {
    if (!selected) return false;
    const [sr, sc] = selected;
    if (r === sr && c === sc) return false;
    return r === sr || c === sc ||
      (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
  }

  function isSameNum(r, c) {
    if (!selected || !board) return false;
    const sv = board[selected[0]][selected[1]];
    return sv !== 0 && board[r][c] === sv;
  }

  function saveHistory() {
    setHistory((h) => [...h, {
      board: board.map((r) => [...r]),
      notes: Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, new Set(v)])),
      mistakeCount,
    }]);
  }

  function stampNote(r, c, num) {
    if (!board || won || paused || given[r][c] || board[r][c] !== 0) return;
    saveHistory();
    const key = `${r}-${c}`;
    const cur = notes[key] || new Set();
    const next = new Set(cur);
    if (next.has(num)) next.delete(num); else next.add(num);
    setNotes((prev) => ({ ...prev, [key]: next }));
  }

  function inputNum(num) {
    if (pencilMode) {
      if (num === 0) { setPencilNum(null); return; }
      setPencilNum((prev) => (prev === num ? null : num));
      return;
    }
    if (!selected || !board || won || paused) return;
    const [r, c] = selected;
    if (given[r][c]) return;

    saveHistory();
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;

    let newMistakes = mistakeCount;
    const isCorrect = num === 0 || solution[r][c] === num;

    if (num !== 0 && !isCorrect) {
      newMistakes = mistakeCount + 1;
      setMistakeCount(newMistakes);
      setLastAction({ type: 'wrong', r, c, id: Date.now() });
    } else if (num !== 0) {
      setLastAction({ type: 'correct', r, c, id: Date.now() });
    }

    let newNotes = Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, new Set(v)]));
    delete newNotes[`${r}-${c}`];
    if (autoRemove && num !== 0) {
      for (let i = 0; i < 9; i++) {
        [`${r}-${i}`, `${i}-${c}`].forEach((k) => {
          if (newNotes[k]) { const s = new Set(newNotes[k]); s.delete(num); newNotes[k] = s; }
        });
      }
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let rr = br; rr < br + 3; rr++)
        for (let cc = bc; cc < bc + 3; cc++) {
          const k = `${rr}-${cc}`;
          if (newNotes[k]) { const s = new Set(newNotes[k]); s.delete(num); newNotes[k] = s; }
        }
    }
    setNotes(newNotes);
    setBoard(newBoard);

    const complete = newBoard.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]));
    if (complete) {
      setWon(true);
      setStreak((s) => s + 1);
      setScore(calcScore(seconds, difficulty, newMistakes));
    } else if (num !== 0 && isCorrect) {
      checkCompletions(newBoard, solution, board);
    }
  }

  function fastPencil() {
    if (!board || won || paused) return;
    if (fastPencilOn) {
      setNotes(preAutoNotes || {});
      setFastPencilOn(false);
      setPreAutoNotes(null);
    } else {
      const snapshot = Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, new Set(v)]));
      setPreAutoNotes(snapshot);
      const candidates = calcCandidates(board);
      const merged = Object.fromEntries(Object.entries(snapshot).map(([k, v]) => [k, new Set(v)]));
      for (const [key, set] of Object.entries(candidates)) {
        if (!merged[key]) merged[key] = new Set();
        for (const n of set) merged[key].add(n);
      }
      setNotes(merged);
      setFastPencilOn(true);
    }
  }

  function erase() {
    if (!selected || !board || won || paused) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    saveHistory();
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    const newNotes = Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, new Set(v)]));
    delete newNotes[`${r}-${c}`];
    setNotes(newNotes);
  }

  function undo() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setBoard(prev.board);
    setNotes(prev.notes);
    setMistakeCount(prev.mistakeCount);
    setHistory((h) => h.slice(0, -1));
    setFastPencilOn(false);
    setPreAutoNotes(null);
  }

  function hint() {
    if (!board || !solution || !selected || won || paused) return;
    const [r, c] = selected;
    if (given[r][c] || board[r][c] === solution[r][c]) return;
    saveHistory();
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = solution[r][c];
    setBoard(newBoard);
    setLastAction({ type: 'correct', r, c, id: Date.now() });
    const newNotes = Object.fromEntries(Object.entries(notes).map(([k, v]) => [k, new Set(v)]));
    delete newNotes[`${r}-${c}`];
    setNotes(newNotes);
    const complete = newBoard.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]));
    if (complete) {
      setWon(true);
      setStreak((s) => s + 1);
      setScore(calcScore(seconds, difficulty, mistakeCount));
    } else {
      checkCompletions(newBoard, solution, board);
    }
  }

  function togglePause()      { setPaused((p) => !p); }
  function toggleAutoRemove() { setAutoRemove((v) => !v); }
  function togglePencilMode() { setPencilMode((p) => { if (p) setPencilNum(null); return !p; }); }
  function changeDifficulty(diff) { setShowDiffMenu(false); setDifficulty(diff); startGame(diff); }

  return {
    difficulty, given, board, solution,
    selected, setSelected,
    mistakeCount, won, paused,
    pencilMode, pencilNum,
    notes, streak, autoRemove, score,
    showDiffMenu, setShowDiffMenu,
    fastPencilOn, seconds,
    lastAction, toast,
    conflicts, remaining, selectedVal,
    isHighlighted, isSameNum,
    startGame, inputNum, stampNote,
    fastPencil, erase, undo, hint,
    togglePause, toggleAutoRemove,
    togglePencilMode, changeDifficulty,
  };
}
