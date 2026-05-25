import { useTheme } from '../contexts/ThemeContext.jsx';
import { fmtTime } from '../hooks/useTimer.js';

export default function InfoBar({
  mistakeCount, difficulty, seconds, paused,
  showDiffMenu, onToggleDiffMenu, onDiffChange, onTogglePause, score,
}) {
  const { theme } = useTheme();
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: theme.primary }}>
          Score: {score.toLocaleString()}
        </div>
      </div>

      <div style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.textMuted }}>
          Mistakes: <span style={{ color: mistakeCount > 0 ? theme.mistakeRed : theme.textMuted }}>{mistakeCount}</span>/3
        </span>

        <div style={{ position: 'relative' }}>
          <span
            style={{ fontSize: 13, fontWeight: 700, color: theme.primary, cursor: 'pointer', padding: '2px 8px' }}
            onClick={onToggleDiffMenu}>
            {diffLabel} ▾
          </span>
          {showDiffMenu && (
            <div style={{
              position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
              background: theme.diffMenuBg, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              overflow: 'hidden', zIndex: 50, minWidth: 110,
            }}>
              {['easy', 'medium', 'hard', 'expert'].map((d) => (
                <div key={d}
                  style={{
                    padding: '10px 18px', fontSize: 13, fontWeight: 700,
                    color: d === difficulty ? theme.primary : theme.diffMenuText,
                    background: d === difficulty ? theme.primaryPale : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => onDiffChange(d)}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.textMuted, fontVariantNumeric: 'tabular-nums' }}>
            {fmtTime(seconds)}
          </span>
          <button
            onClick={onTogglePause}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              border: `2px solid ${theme.border}`,
              background: theme.btnActionFace,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 10, color: theme.primary,
            }}>
            {paused ? '▶' : '⏸'}
          </button>
        </div>
      </div>
    </>
  );
}
