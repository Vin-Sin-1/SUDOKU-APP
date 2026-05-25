import { useTheme } from '../contexts/ThemeContext.jsx';

export default function NumberPad({ remaining, selectedVal, pencilMode, pencilNum, onInput }) {
  const { theme } = useTheme();

  return (
    <div style={{
      width: '100%', padding: '0 8px',
      display: 'grid', gridTemplateColumns: 'repeat(9,1fr)',
      gap: 5,
    }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const rem = remaining[n];
        const done = rem === 0;
        const isActive = pencilMode ? pencilNum === n : selectedVal === n;
        const numColor = theme.numberColors ? theme.numberColors[n] : null;

        return (
          <button key={n}
            className="btn-num-3d"
            onClick={() => onInput(n)}
            disabled={done}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '10px 0 6px',
              borderRadius: 12,
              border: 'none',
              background: isActive ? theme.btnNumActiveFace : theme.btnNumFace,
              cursor: done ? 'default' : 'pointer',
              opacity: done ? 0.35 : 1,
              boxShadow: isActive
                ? `0 5px 0 ${theme.btnNumActiveEdge}, 0 7px 14px rgba(0,0,0,0.25)`
                : `0 5px 0 ${theme.btnNumEdge}, 0 7px 14px rgba(0,0,0,0.2)`,
            }}>
            <span style={{
              fontSize: 'clamp(18px,5vw,26px)',
              fontWeight: 800,
              color: isActive ? theme.btnNumActiveText : (numColor || theme.btnNumText),
              lineHeight: 1,
            }}>{n}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, marginTop: 2,
              color: isActive ? `${theme.btnNumActiveText}99` : `${theme.btnNumText}99`,
            }}>{rem}</span>
          </button>
        );
      })}
    </div>
  );
}
