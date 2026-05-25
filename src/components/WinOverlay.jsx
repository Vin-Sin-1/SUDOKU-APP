import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { fmtTime } from '../hooks/useTimer.js';
import { getRandomMessage } from '../constants/messages.js';

export default function WinOverlay({ won, score, difficulty, seconds, mistakeCount, streak, onPlayAgain }) {
  const { theme } = useTheme();
  const [winMsg, setWinMsg] = useState('');

  useEffect(() => {
    if (won) setWinMsg(getRandomMessage('win'));
  }, [won]);

  if (!won) return null;
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: theme.overlayBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div className="win-pop" style={{
        background: theme.diffMenuBg,
        borderRadius: 28,
        padding: '44px 36px',
        textAlign: 'center',
        boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 2px ${theme.primary}44`,
        maxWidth: 320, width: '88%',
      }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: theme.primary, marginBottom: 12 }}>
          {winMsg}
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: theme.diffMenuText, marginBottom: 4 }}>
          {score.toLocaleString()} pts
        </div>
        <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 4 }}>
          {diffLabel} • {fmtTime(seconds)}
        </div>
        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8 }}>
          Streak: {streak} 🔥
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, marginBottom: 28,
          color: mistakeCount === 0 ? theme.primary : theme.mistakeRed,
        }}>
          {mistakeCount === 0 ? '⭐ Perfect — no mistakes!' : `${mistakeCount} mistake${mistakeCount > 1 ? 's' : ''}`}
        </div>
        <button onClick={onPlayAgain} style={{
          width: '100%', padding: '14px 0',
          background: theme.btnNumFace,
          color: theme.btnNumText, border: 'none', borderRadius: 16,
          fontWeight: 800, fontSize: 16, cursor: 'pointer',
          boxShadow: `0 5px 0 ${theme.btnNumEdge}, 0 8px 20px rgba(0,0,0,0.3)`,
        }}>Play Again</button>
      </div>
    </div>
  );
}
