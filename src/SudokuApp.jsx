import { useEffect } from 'react';
import { useGame } from './hooks/useGame.js';
import C from './constants/colors.js';
import Header from './components/Header.jsx';
import InfoBar from './components/InfoBar.jsx';
import Grid from './components/Grid.jsx';
import ActionBar from './components/ActionBar.jsx';
import NumberPad from './components/NumberPad.jsx';
import WinOverlay from './components/WinOverlay.jsx';

export default function SudokuApp() {
  const game = useGame();

  // Keyboard handler
  useEffect(() => {
    function onKey(e) {
      if (game.won || game.paused) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) game.inputNum(num);
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') game.inputNum(0);
      if (!game.selected) return;
      if (e.key === 'ArrowUp')    game.setSelected(([r, c]) => [Math.max(0, r - 1), c]);
      if (e.key === 'ArrowDown')  game.setSelected(([r, c]) => [Math.min(8, r + 1), c]);
      if (e.key === 'ArrowLeft')  game.setSelected(([r, c]) => [r, Math.max(0, c - 1)]);
      if (e.key === 'ArrowRight') game.setSelected(([r, c]) => [r, Math.min(8, c + 1)]);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game.selected, game.board, game.won, game.paused, game.pencilMode]);

  if (!game.board) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: C.primary, fontWeight: 700 }}>Loading…</span>
    </div>
  );

  return (
    <div style={{
      height: '100svh',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      userSelect: 'none',
      overflow: 'hidden',
    }}>
      <Header streak={game.streak} />

      <InfoBar
        mistakeCount={game.mistakeCount}
        difficulty={game.difficulty}
        seconds={game.seconds}
        paused={game.paused}
        score={game.score}
        showDiffMenu={game.showDiffMenu}
        onToggleDiffMenu={() => game.setShowDiffMenu((v) => !v)}
        onDiffChange={game.changeDifficulty}
        onTogglePause={game.togglePause}
      />

      <Grid
        board={game.board}
        given={game.given}
        selected={game.selected}
        notes={game.notes}
        conflicts={game.conflicts}
        pencilMode={game.pencilMode}
        pencilNum={game.pencilNum}
        won={game.won}
        paused={game.paused}
        isHighlighted={game.isHighlighted}
        isSameNum={game.isSameNum}
        onSelectCell={(r, c) => game.setSelected([r, c])}
        onStampNote={game.stampNote}
        onResume={game.togglePause}
      />

      <ActionBar
        pencilMode={game.pencilMode}
        fastPencilOn={game.fastPencilOn}
        onUndo={game.undo}
        onErase={game.erase}
        onFastPencil={game.fastPencil}
        onTogglePencil={game.togglePencilMode}
        onHint={game.hint}
      />

      <NumberPad
        remaining={game.remaining}
        selectedVal={game.selectedVal}
        pencilMode={game.pencilMode}
        pencilNum={game.pencilNum}
        onInput={game.inputNum}
      />

      <div style={{
        width: '100%', padding: '0 12px',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 700 }}>Auto-remove notes</span>
        <div onClick={game.toggleAutoRemove} style={{
          width: 40, height: 22, borderRadius: 11,
          background: game.autoRemove ? C.primary : C.border,
          position: 'relative', cursor: 'pointer',
          transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 3, left: game.autoRemove ? 20 : 3,
            width: 16, height: 16, borderRadius: '50%',
            background: C.white,
            transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }} />
        </div>
      </div>

      <WinOverlay
        won={game.won}
        score={game.score}
        difficulty={game.difficulty}
        seconds={game.seconds}
        mistakeCount={game.mistakeCount}
        streak={game.streak}
        onPlayAgain={() => game.startGame()}
      />
    </div>
  );
}
