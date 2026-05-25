# Sudoku App — Refactor Plan

## Core Principles
These apply to every decision made in this project — refactor, new feature, or bug fix.

1. **Modular development** — every piece of logic lives in its own file with a single responsibility. No function does two jobs. No file mixes UI with game logic. New features slot in without touching unrelated code.

2. **Beautiful GUI, no compromise** — the mint green design, spacing, typography, and animations are non-negotiable. Refactoring must never degrade the visual quality. Every component owns its own styling and matches the design system in `colors.js`.

3. **User friendly** — interactions must feel instant and natural on a phone. Tap targets are large enough, feedback is immediate, nothing blocks the user. If a change makes the app harder to use, it gets reverted.

---

## Current State
Everything lives in one file: `sudoku.jsx`
- Sudoku engine (pure functions)
- Timer hook
- Color constants
- All game state
- All game handlers
- All UI components

---

## Target Structure

```
src/
  constants/
    colors.js
  engine/
    sudoku.js
    candidates.js
    scoring.js
  hooks/
    useTimer.js
    useGame.js
  components/
    Header.jsx
    InfoBar.jsx
    Grid.jsx
    ActionBar.jsx
    NumberPad.jsx
    WinOverlay.jsx
  SudokuApp.jsx
```

---

## Step-by-Step Migration

### Step 1 — Constants
**`src/constants/colors.js`**
- Move the `C` object out of `sudoku.jsx`
- Export as default
- All components import from here

---

### Step 2 — Engine
**`src/engine/sudoku.js`**
- `shuffle(arr)`
- `isValid(board, row, col, num)`
- `findEmpty(board)`
- `fillBoard(board)`
- `createPuzzle(difficulty)` → returns `{ puzzle, solution }`

**`src/engine/candidates.js`**
- `calcCandidates(board)` → returns notes object
- `getConflicts(board)` → returns Set of conflict keys

**`src/engine/scoring.js`**
- `calcScore(timeSeconds, difficulty, mistakes)`

All engine functions are pure JS — no React, no state, easy to unit test.

---

### Step 3 — Hooks
**`src/hooks/useTimer.js`**
- Extract `useTimer(running)` hook as-is
- Export `fmtTime(s)` helper alongside it

**`src/hooks/useGame.js`**
This is the big one. Owns all game state and handlers.

**State it manages:**
```
difficulty, given, board, solution,
selected, mistakeCount, won, paused,
pencilMode, pencilNum, notes,
history, streak, autoRemove, score,
showDiffMenu, fastPencilOn, preAutoNotes
```

**Handlers it exposes:**
```
startGame(diff?)
inputNum(num)
stampNote(r, c, num)
fastPencil()
erase()
undo()
hint()
```

**Derived values it exposes:**
```
conflicts        ← getConflicts(board)
remaining        ← count of each digit left
selectedVal      ← value at selected cell
seconds          ← from useTimer
isHighlighted(r, c)
isSameNum(r, c)
```

**Design note:**
`saveHistory()` stays private inside `useGame` — components never call it directly.
History state is separate from game state so persistence can be added later without touching history.

---

### Step 4 — Components

**`src/components/Header.jsx`**
Props: `streak`
- Streak display
- Icon row (☆ ⬡ 🎨 ⚙)
- Back arrow

**`src/components/InfoBar.jsx`**
Props: `mistakeCount, difficulty, seconds, paused, showDiffMenu, onDiffChange, onToggleDiffMenu, onTogglePause`
- Mistakes counter
- Difficulty dropdown
- Timer + pause button

**`src/components/Grid.jsx`**
Props: `board, given, selected, notes, conflicts, pencilMode, pencilNum, won, paused, onSelectCell, onStampNote, onResume`
- Renders all 81 cells
- Handles cell background logic (selected, conflict, highlight, sameNum)
- Renders digit or pencil notes per cell
- Pause overlay
- No game logic — just display + tap callbacks

**`src/components/ActionBar.jsx`**
Props: `pencilMode, fastPencilOn, onUndo, onErase, onFastPencil, onTogglePencil, onHint`
- 5 action buttons: Undo, Erase, Fast Pencil, Pencil, Hint
- Handles ON/OFF badge display
- No game logic

**`src/components/NumberPad.jsx`**
Props: `remaining, selectedVal, pencilMode, pencilNum, onInput`
- 9 number buttons
- Shows remaining count per digit
- Highlights active number
- Disables completed digits

**`src/components/WinOverlay.jsx`**
Props: `won, score, difficulty, seconds, mistakeCount, streak, onPlayAgain`
- Win screen overlay
- Score, time, difficulty, streak, mistake summary
- Play Again button

---

### Step 5 — SudokuApp.jsx
Wire everything together.
- Call `useGame()` to get all state and handlers
- Render components in order:
  `Header → InfoBar → Grid → ActionBar → NumberPad → AutoRemoveToggle → WinOverlay`
- Keyboard handler (`useEffect` for arrow keys + number keys) stays here or moves into `useGame`

---

## What Stays Out of Scope (for now)
- `localStorage` persistence — add after refactor
- Firebase / multiplayer — add after refactor
- Unit tests for engine functions — easy to add after engine is isolated

---

## Rules for the Refactor
1. No new features during refactor — behaviour must be identical before and after
2. One step at a time — constants → engine → hooks → components → SudokuApp
3. Deploy and test on phone after each step
4. `sudoku.jsx` stays untouched until the final step when it gets replaced by `SudokuApp.jsx`
