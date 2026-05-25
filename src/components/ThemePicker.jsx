import { useTheme } from '../contexts/ThemeContext.jsx';
import themes from '../constants/themes.js';

export default function ThemePicker({ onClose }) {
  const { theme, themeId, changeTheme } = useTheme();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(6px)',
    }} onClick={onClose}>
      <div style={{
        background: theme.diffMenuBg,
        borderRadius: '28px 28px 0 0',
        padding: '28px 20px 44px',
        width: '100%',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(128,128,128,0.3)',
          margin: '0 auto 20px',
        }} />

        <div style={{
          textAlign: 'center', marginBottom: 20,
          fontSize: 18, fontWeight: 900, color: theme.diffMenuText,
          letterSpacing: 0.3,
        }}>Choose Your Theme</div>

        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto',
          paddingBottom: 8, scrollbarWidth: 'none',
        }}>
          {Object.values(themes).map((t) => {
            const isActive = themeId === t.id;
            return (
              <div key={t.id}
                className="theme-card"
                onClick={() => { changeTheme(t.id); onClose(); }}
                style={{
                  flex: '0 0 110px',
                  background: t.appBg,
                  borderRadius: 20,
                  padding: '18px 10px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isActive ? `3px solid ${t.primary}` : '3px solid transparent',
                  boxShadow: isActive
                    ? `0 0 0 2px ${t.primary}, 0 8px 20px rgba(0,0,0,0.3)`
                    : '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: t.white, marginBottom: 4 }}>{t.name}</div>
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: 4, marginTop: 6,
                }}>
                  {[t.primary, t.cellBg, t.textUser].map((col, i) => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: col, border: '1px solid rgba(255,255,255,0.3)',
                    }} />
                  ))}
                </div>
                {isActive && (
                  <div style={{
                    marginTop: 8, fontSize: 11, fontWeight: 800,
                    color: t.primary, background: 'rgba(255,255,255,0.2)',
                    borderRadius: 8, padding: '2px 6px',
                  }}>✓ Active</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
