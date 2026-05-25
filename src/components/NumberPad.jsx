import C from '../constants/colors.js';

export default function NumberPad({ remaining, selectedVal, pencilMode, pencilNum, onInput }) {
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
        return (
          <button key={n}
            onClick={() => onInput(n)}
            disabled={done}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '10px 0 6px',
              borderRadius: 12,
              border: isActive ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`,
              background: isActive ? C.primaryPale : C.white,
              cursor: done ? 'default' : 'pointer',
              opacity: done ? 0.35 : 1,
              boxShadow: '0 2px 8px rgba(46,158,107,0.07)',
              transition: 'all 0.15s',
            }}>
            <span style={{
              fontSize: 'clamp(18px,5vw,26px)',
              fontWeight: 800,
              color: C.primary,
              lineHeight: 1,
            }}>{n}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.textLight, marginTop: 2 }}>{rem}</span>
          </button>
        );
      })}
    </div>
  );
}
