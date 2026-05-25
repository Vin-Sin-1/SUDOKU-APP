import C from '../constants/colors.js';
import { fmtTime } from '../hooks/useTimer.js';

export default function WinOverlay({ won, score, difficulty, seconds, mistakeCount, streak, onPlayAgain }) {
  if (!won) return null;
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(232,245,239,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        background: C.white,
        borderRadius: 28,
        padding: '44px 36px',
        textAlign: 'center',
        boxShadow: `0 20px 60px rgba(46,158,107,0.2), 0 0 0 2px ${C.primaryPale}`,
        maxWidth: 320, width: '88%',
      }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>🎉</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.primary, marginBottom: 4 }}>
          Puzzle Solved!
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: C.text, marginBottom: 4 }}>
          {score.toLocaleString()} pts
        </div>
        <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 4 }}>
          {diffLabel} • {fmtTime(seconds)}
        </div>
        <div style={{ fontSize: 13, color: C.textLight, marginBottom: 8 }}>
          Streak: {streak} 🔥
        </div>
        <div style={{ fontSize: 13, color: mistakeCount === 0 ? C.primary : C.mistakeRed, marginBottom: 28, fontWeight: 700 }}>
          {mistakeCount === 0 ? '⭐ Perfect — no mistakes!' : `${mistakeCount} mistake${mistakeCount > 1 ? 's' : ''}`}
        </div>
        <button onClick={onPlayAgain} style={{
          width: '100%', padding: '14px 0',
          background: `linear-gradient(135deg,${C.primary},${C.primaryLight})`,
          color: C.white, border: 'none', borderRadius: 16,
          fontWeight: 800, fontSize: 16, cursor: 'pointer',
          boxShadow: `0 4px 16px rgba(46,158,107,0.35)`,
        }}>Play Again</button>
      </div>
    </div>
  );
}
