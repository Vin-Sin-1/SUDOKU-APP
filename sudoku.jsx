import { useState, useEffect, useCallback, useRef } from "react";

// ─── Sudoku Engine ───────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(board, row, col, num) {
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
  for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (isValid(board, r, c, n)) {
      board[r][c] = n;
      if (fillBoard(board)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}

function createPuzzle(difficulty) {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(solution);
  const puzzle = solution.map(r => [...r]);
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

function getConflicts(board) {
  const conflicts = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (!v) continue;
      for (let cc = 0; cc < 9; cc++)
        if (cc !== c && board[r][cc] === v) { conflicts.add(`${r}-${c}`); conflicts.add(`${r}-${cc}`); }
      for (let rr = 0; rr < 9; rr++)
        if (rr !== r && board[rr][c] === v) { conflicts.add(`${r}-${c}`); conflicts.add(`${rr}-${c}`); }
      const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
      for (let rr = br; rr < br+3; rr++)
        for (let cc = bc; cc < bc+3; cc++)
          if ((rr !== r || cc !== c) && board[rr][cc] === v) {
            conflicts.add(`${r}-${c}`); conflicts.add(`${rr}-${cc}`);
          }
    }
  }
  return conflicts;
}

function calcCandidates(board) {
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

function calcScore(timeSeconds, difficulty, mistakes) {
  const base = { easy: 5000, medium: 8000, hard: 12000, expert: 18000 }[difficulty] ?? 8000;
  const timePenalty = timeSeconds * 3;
  const mistakePenalty = mistakes * 500;
  return Math.max(0, base - timePenalty - mistakePenalty);
}

// ─── Timer Hook ──────────────────────────────────────────────────
function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  return { seconds, reset: () => setSeconds(0) };
}

function fmtTime(s) {
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
}

// ─── Colors ──────────────────────────────────────────────────────
const C = {
  bg:          "#e8f5ef",
  bgDark:      "#d4ece0",
  primary:     "#2e9e6b",
  primaryLight:"#4ab882",
  primaryPale: "#c8ead9",
  gridBg:      "#f0faf5",
  cellBg:      "#f7fcf9",
  cellSelect:  "#2e9e6b",
  cellHover:   "#d6f0e3",
  cellSameNum: "#b8e8ce",
  cellConflict:"#fddcdc",
  given:       "#1a3d2b",
  userNum:     "#2e9e6b",
  conflict:    "#e05252",
  note:        "#2e9e6b",
  border:      "#b5d9c5",
  borderBox:   "#2e9e6b",
  text:        "#1a3d2b",
  textMuted:   "#6aaa8a",
  textLight:   "#a0c9b0",
  white:       "#ffffff",
  eraseBtn:    "#f0faf5",
  mistakeRed:  "#e05252",
};

// ─── Main App ────────────────────────────────────────────────────
export default function SudokuApp() {
  const [difficulty, setDifficulty] = useState("expert");
  const [given, setGiven]     = useState(null);
  const [board, setBoard]     = useState(null);
  const [solution, setSolution] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [won, setWon]         = useState(false);
  const [paused, setPaused]   = useState(false);
  const [pencilMode, setPencilMode] = useState(false);
  const [pencilNum, setPencilNum]   = useState(null); // sticky pencil number
  const [notes, setNotes]     = useState({});
  const [history, setHistory] = useState([]);
  const [streak, setStreak]   = useState(12);
  const [autoRemove, setAutoRemove] = useState(true);
  const [score, setScore]     = useState(0);
  const [showDiffMenu, setShowDiffMenu] = useState(false);
  const [fastPencilOn, setFastPencilOn] = useState(false);
  const [preAutoNotes, setPreAutoNotes] = useState(null);

  const timerRunning = !!(board && !won && !paused);
  const { seconds, reset: resetTimer } = useTimer(timerRunning);

  const startGame = useCallback((diff = difficulty) => {
    const { puzzle, solution: sol } = createPuzzle(diff);
    setGiven(puzzle.map(r => r.map(v => v !== 0)));
    setBoard(puzzle.map(r => [...r]));
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
    resetTimer();
  }, [difficulty, resetTimer]);

  useEffect(() => { startGame(); }, []);

  const conflicts  = board ? getConflicts(board) : new Set();

  // Count remaining placements per number
  const remaining = {};
  for (let n = 1; n <= 9; n++) {
    let count = 0;
    if (board) board.forEach(row => row.forEach(v => { if (v === n) count++; }));
    remaining[n] = 9 - count;
  }

  const selectedVal = selected && board ? board[selected[0]][selected[1]] : 0;

  function isHighlighted(r, c) {
    if (!selected) return false;
    const [sr, sc] = selected;
    if (r === sr && c === sc) return false;
    return r === sr || c === sc ||
      (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3));
  }

  function isSameNum(r, c) {
    if (!selected || !board) return false;
    const sv = board[selected[0]][selected[1]];
    return sv !== 0 && board[r][c] === sv;
  }

  function saveHistory() {
    setHistory(h => [...h, {
      board: board.map(r => [...r]),
      notes: Object.fromEntries(Object.entries(notes).map(([k,v]) => [k, new Set(v)])),
      mistakeCount,
    }]);
  }

  // Stamp a pencil note onto a specific cell (called from cell onClick in pencil mode)
  function stampNote(r, c, num) {
    if (!board || won || paused || given[r][c] || board[r][c] !== 0) return;
    saveHistory();
    const key = `${r}-${c}`;
    const cur = notes[key] || new Set();
    const next = new Set(cur);
    if (next.has(num)) next.delete(num); else next.add(num);
    setNotes(prev => ({ ...prev, [key]: next }));
  }

  function inputNum(num) {
    // In pencil mode: tapping a number just sets/clears the sticky pencil number
    if (pencilMode) {
      if (num === 0) { setPencilNum(null); return; }
      setPencilNum(prev => (prev === num ? null : num));
      return;
    }
    if (!selected || !board || won || paused) return;
    const [r, c] = selected;
    if (given[r][c]) return;

    saveHistory();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;

    let newMistakes = mistakeCount;
    if (num !== 0 && solution[r][c] !== num) {
      newMistakes = mistakeCount + 1;
      setMistakeCount(newMistakes);
    }

    // remove notes in same row/col/box for this number
    let newNotes = Object.fromEntries(Object.entries(notes).map(([k,v]) => [k, new Set(v)]));
    delete newNotes[`${r}-${c}`];
    if (autoRemove && num !== 0) {
      for (let i = 0; i < 9; i++) {
        [`${r}-${i}`, `${i}-${c}`].forEach(k => {
          if (newNotes[k]) { const s = new Set(newNotes[k]); s.delete(num); newNotes[k] = s; }
        });
      }
      const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
      for (let rr = br; rr < br+3; rr++)
        for (let cc = bc; cc < bc+3; cc++) {
          const k = `${rr}-${cc}`;
          if (newNotes[k]) { const s = new Set(newNotes[k]); s.delete(num); newNotes[k] = s; }
        }
    }
    setNotes(newNotes);
    setBoard(newBoard);

    const complete = newBoard.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]));
    if (complete) {
      setWon(true);
      setStreak(s => s + 1);
      setScore(calcScore(seconds, difficulty, newMistakes));
    }
  }

  function fastPencil() {
    if (!board || won || paused) return;
    if (fastPencilOn) {
      setNotes(preAutoNotes || {});
      setFastPencilOn(false);
      setPreAutoNotes(null);
    } else {
      const snapshot = Object.fromEntries(Object.entries(notes).map(([k,v]) => [k, new Set(v)]));
      setPreAutoNotes(snapshot);
      const candidates = calcCandidates(board);
      const merged = Object.fromEntries(Object.entries(snapshot).map(([k,v]) => [k, new Set(v)]));
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
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    const newNotes = Object.fromEntries(Object.entries(notes).map(([k,v]) => [k, new Set(v)]));
    delete newNotes[`${r}-${c}`];
    setNotes(newNotes);
  }

  function undo() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setBoard(prev.board);
    setNotes(prev.notes);
    setMistakeCount(prev.mistakeCount);
    setHistory(h => h.slice(0, -1));
    setFastPencilOn(false);
    setPreAutoNotes(null);
  }

  function hint() {
    if (!board || !solution || !selected || won || paused) return;
    const [r, c] = selected;
    if (given[r][c] || board[r][c] === solution[r][c]) return;
    saveHistory();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = solution[r][c];
    setBoard(newBoard);
    const newNotes = Object.fromEntries(Object.entries(notes).map(([k,v]) => [k, new Set(v)]));
    delete newNotes[`${r}-${c}`];
    setNotes(newNotes);
    const complete = newBoard.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]));
    if (complete) { setWon(true); setStreak(s => s + 1); setScore(calcScore(seconds, difficulty, mistakeCount)); }
  }

  useEffect(() => {
    function onKey(e) {
      if (won || paused) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) inputNum(num);
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") inputNum(0);
      if (!selected) return;
      if (e.key === "ArrowUp")    setSelected(([r,c]) => [Math.max(0,r-1),c]);
      if (e.key === "ArrowDown")  setSelected(([r,c]) => [Math.min(8,r+1),c]);
      if (e.key === "ArrowLeft")  setSelected(([r,c]) => [r,Math.max(0,c-1)]);
      if (e.key === "ArrowRight") setSelected(([r,c]) => [r,Math.min(8,c+1)]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, board, won, paused, pencilMode]);

  if (!board) return <div style={{ background: C.bg, minHeight: "100vh", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{color:C.primary,fontWeight:700}}>Loading…</span></div>;

  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <div style={{
      height: "100svh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-evenly",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      userSelect: "none",
      overflow: "hidden",
    }}>
      {/* ── Header ── */}
      <div style={{
        width: "100%", maxWidth: 430,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 8px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:22, color:C.primary, cursor:"pointer" }}>←</span>
          <span style={{ fontWeight:800, fontSize:16, color:C.primary }}>Streak {streak}</span>
        </div>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          {["☆","⬡","🎨","⚙"].map((icon,i) => (
            <span key={i} style={{ fontSize:20, color:C.textMuted, cursor:"pointer" }}>{icon}</span>
          ))}
        </div>
      </div>

      {/* ── Score ── */}
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:20, fontWeight:800, color:C.primary }}>
          Score: {score.toLocaleString()}
        </div>
      </div>

      {/* ── Info bar ── */}
      <div style={{
        width:"100%", maxWidth:430,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 16px",
      }}>
        <span style={{ fontSize:13, fontWeight:700, color:C.textMuted }}>
          Mistakes: <span style={{ color: mistakeCount > 0 ? C.mistakeRed : C.textMuted }}>{mistakeCount}</span>/3
        </span>
        <div style={{ position:"relative" }}>
          <span
            style={{ fontSize:13, fontWeight:700, color:C.primary, cursor:"pointer", padding:"2px 8px" }}
            onClick={() => setShowDiffMenu(v => !v)}>
            {diffLabel} ▾
          </span>
          {showDiffMenu && (
            <div style={{
              position:"absolute", top:24, left:"50%", transform:"translateX(-50%)",
              background:C.white, borderRadius:12, boxShadow:"0 4px 20px rgba(0,0,0,0.12)",
              overflow:"hidden", zIndex:50, minWidth:110,
            }}>
              {["easy","medium","hard","expert"].map(d => (
                <div key={d}
                  style={{
                    padding:"10px 18px", fontSize:13, fontWeight:700,
                    color: d === difficulty ? C.primary : C.text,
                    background: d === difficulty ? C.primaryPale : "transparent",
                    cursor:"pointer",
                  }}
                  onClick={() => { setShowDiffMenu(false); setDifficulty(d); startGame(d); }}>
                  {d.charAt(0).toUpperCase()+d.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.textMuted, fontVariantNumeric:"tabular-nums" }}>
            {fmtTime(seconds)}
          </span>
          <button
            onClick={() => setPaused(p => !p)}
            style={{
              width:24, height:24, borderRadius:"50%",
              border:`2px solid ${C.border}`, background:C.white,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", fontSize:10, color:C.primary,
            }}>
            {paused ? "▶" : "⏸"}
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{
        width:"100%", maxWidth:"100%",
        aspectRatio:"1/1",
        background:C.gridBg,
        borderRadius:0,
        border:"none",
        overflow:"hidden",
        margin:0,
        boxShadow:"0 4px 20px rgba(46,158,107,0.1)",
        position:"relative",
      }}>
        {paused ? (
          <div style={{
            position:"absolute", inset:0,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            background:"rgba(232,245,239,0.95)",
          }}>
            <div style={{ fontSize:40 }}>⏸</div>
            <div style={{ fontWeight:800, color:C.primary, fontSize:18, marginTop:8 }}>Paused</div>
            <button onClick={() => setPaused(false)} style={{
              marginTop:16, padding:"10px 28px", background:C.primary, color:C.white,
              border:"none", borderRadius:12, fontWeight:700, fontSize:15, cursor:"pointer",
            }}>Resume</button>
          </div>
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(9,1fr)",
            gridTemplateRows:"repeat(9,1fr)",
            width:"100%", height:"100%",
          }}>
            {board.map((row, r) => row.map((val, c) => {
              const key   = `${r}-${c}`;
              const isSel = selected && selected[0]===r && selected[1]===c;
              const isConf= conflicts.has(key);
              const isHi  = isHighlighted(r, c);
              const isSame= isSameNum(r, c);
              const isGiven = given[r][c];
              const cellNotes = notes[key];

              let bg = C.cellBg;
              let textColor = C.given;
              const hasPencilNote = pencilMode && pencilNum && cellNotes && cellNotes.has(pencilNum);
              if (isSel)        { bg = C.cellSelect; textColor = C.white; }
              else if (isConf)  { bg = C.cellConflict; textColor = C.conflict; }
              else if (hasPencilNote) { bg = "#d0f0e0"; }
              else if (isSame)  { bg = C.cellSameNum; textColor = isGiven ? C.given : C.userNum; }
              else if (isHi)    { bg = C.cellHover; textColor = isGiven ? C.given : C.userNum; }
              else if (!isGiven && val) textColor = C.userNum;

              const borderRight  = (c+1)%3===0 && c!==8 ? `2px solid ${C.borderBox}` : `1px solid ${C.border}`;
              const borderBottom = (r+1)%3===0 && r!==8 ? `2px solid ${C.borderBox}` : `1px solid ${C.border}`;

              return (
                <div key={key}
                  style={{
                    background: bg,
                    borderRight, borderBottom,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor: isGiven ? "default" : "pointer",
                    transition:"background 0.1s",
                    position:"relative",
                  }}
                  onClick={() => {
                    if (won || paused) return;
                    if (pencilMode && pencilNum) {
                      stampNote(r, c, pencilNum);
                    } else {
                      setSelected([r, c]);
                    }
                  }}>                  {val ? (
                    <span style={{
                      fontSize:"clamp(18px,6vw,32px)",
                      fontWeight: isGiven ? 800 : 600,
                      color: isSel ? C.white : textColor,
                      lineHeight:1,
                    }}>{val}</span>
                  ) : (cellNotes && cellNotes.size > 0) ? (
                    <div style={{
                      display:"grid", gridTemplateColumns:"repeat(3,1fr)",
                      width:"90%", height:"90%",
                      fontSize:"clamp(8px,2.2vw,13px)",
                      color: isSel ? "rgba(255,255,255,0.9)" : C.note,
                      fontWeight:700, textAlign:"center",
                      lineHeight:"1.5",
                    }}>
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <span key={n} style={{ opacity: cellNotes.has(n) ? 1 : 0 }}>{n}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }))}
          </div>
        )}
      </div>

      {/* ── Action bar ── */}
      <div style={{
        width:"100%", padding:"0 12px",
        display:"flex", justifyContent:"space-around", alignItems:"center",
      }}>
        {[
          { label:"Undo",       icon:"↩",  action: undo,        active: false },
          { label:"Erase",      icon:"⬜",  action: erase,       active: false },
          { label:"Fast Pencil",icon:"✏️",  action: fastPencil,  active: fastPencilOn, badge: fastPencilOn?"ON":"OFF" },
          { label:"Pencil",     icon:"✒️",  action: () => { setPencilMode(p => { if(p) setPencilNum(null); return !p; }); }, active: pencilMode, badge: pencilMode?"ON":"OFF" },
          { label:"Hint",       icon:"💡",  action: hint,        active: false, badge:"∞" },
        ].map(({ label, icon, action, active, badge }) => (
          <div key={label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }}
            onClick={action}>
            <div style={{ position:"relative" }}>
              <div style={{
                width:46, height:46, borderRadius:14,
                background: active ? C.primaryPale : C.white,
                border: active ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20,
                boxShadow:"0 2px 8px rgba(46,158,107,0.08)",
              }}>{icon}</div>
              {badge && (
                <div style={{
                  position:"absolute", top:-6, right:-6,
                  background: badge==="ON" ? C.primary : badge==="OFF" ? C.textLight : C.primary,
                  color:C.white, fontSize:8, fontWeight:800,
                  padding:"1px 4px", borderRadius:6,
                  minWidth:16, textAlign:"center",
                }}>{badge}</div>
              )}
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:C.textMuted }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Number Pad ── */}
      <div style={{
        width:"100%", padding:"0 8px",
        display:"grid", gridTemplateColumns:"repeat(9,1fr)",
        gap:5,
      }}>
        {[1,2,3,4,5,6,7,8,9].map(n => {
          const rem = remaining[n];
          const done = rem === 0;
          const isActive = pencilMode ? pencilNum === n : selectedVal === n;
          return (
            <button key={n}
              onClick={() => inputNum(n)}
              disabled={done}
              style={{
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                padding:"10px 0 6px",
                borderRadius:12,
                border: isActive ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`,
                background: isActive ? C.primaryPale : C.white,
                cursor: done ? "default" : "pointer",
                opacity: done ? 0.35 : 1,
                boxShadow:"0 2px 8px rgba(46,158,107,0.07)",
                transition:"all 0.15s",
              }}>
              <span style={{
                fontSize:"clamp(18px,5vw,26px)",
                fontWeight:800,
                color: isActive ? C.primary : C.primary,
                lineHeight:1,
              }}>{n}</span>
              <span style={{
                fontSize:9, fontWeight:700,
                color: C.textLight, marginTop:2,
              }}>{rem}</span>
            </button>
          );
        })}
      </div>

      {/* ── Auto-remove toggle ── */}
      <div style={{
        width:"100%", padding:"0 12px",
        display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8,
      }}>
        <span style={{ fontSize:11, color:C.textMuted, fontWeight:700 }}>Auto-remove notes</span>
        <div
          onClick={() => setAutoRemove(v => !v)}
          style={{
            width:40, height:22, borderRadius:11,
            background: autoRemove ? C.primary : C.border,
            position:"relative", cursor:"pointer",
            transition:"background 0.2s",
          }}>
          <div style={{
            position:"absolute", top:3, left: autoRemove ? 20 : 3,
            width:16, height:16, borderRadius:"50%",
            background:C.white,
            transition:"left 0.2s",
            boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
          }}/>
        </div>
      </div>

      {/* ── Win Overlay ── */}
      {won && (
        <div style={{
          position:"fixed", inset:0,
          background:"rgba(232,245,239,0.92)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          zIndex:100,
          backdropFilter:"blur(10px)",
        }}>
          <div style={{
            background:C.white,
            borderRadius:28,
            padding:"44px 36px",
            textAlign:"center",
            boxShadow:`0 20px 60px rgba(46,158,107,0.2), 0 0 0 2px ${C.primaryPale}`,
            maxWidth:320, width:"88%",
          }}>
            <div style={{ fontSize:60, marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:28, fontWeight:900, color:C.primary, marginBottom:4 }}>
              Puzzle Solved!
            </div>
            <div style={{ fontSize:32, fontWeight:900, color:C.text, marginBottom:4 }}>
              {score.toLocaleString()} pts
            </div>
            <div style={{ fontSize:14, color:C.textMuted, marginBottom:4 }}>
              {diffLabel} • {fmtTime(seconds)}
            </div>
            <div style={{ fontSize:13, color:C.textLight, marginBottom:8 }}>
              Streak: {streak} 🔥
            </div>
            <div style={{ fontSize:13, color: mistakeCount===0 ? C.primary : C.mistakeRed, marginBottom:28, fontWeight:700 }}>
              {mistakeCount===0 ? "⭐ Perfect — no mistakes!" : `${mistakeCount} mistake${mistakeCount>1?"s":""}`}
            </div>
            <button onClick={() => startGame()} style={{
              width:"100%", padding:"14px 0",
              background:`linear-gradient(135deg,${C.primary},${C.primaryLight})`,
              color:C.white, border:"none", borderRadius:16,
              fontWeight:800, fontSize:16, cursor:"pointer",
              boxShadow:`0 4px 16px rgba(46,158,107,0.35)`,
            }}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
