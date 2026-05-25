import { useTheme } from '../contexts/ThemeContext.jsx';

export default function ActionBar({
  pencilMode, fastPencilOn,
  onUndo, onErase, onFastPencil, onTogglePencil, onHint,
}) {
  const { theme } = useTheme();

  const actions = [
    { label: 'Undo',        icon: '↩',  action: onUndo,         active: false },
    { label: 'Erase',       icon: '⬜',  action: onErase,        active: false },
    { label: 'Fast Pencil', icon: '✏️',  action: onFastPencil,   active: fastPencilOn, badge: fastPencilOn ? 'ON' : 'OFF' },
    { label: 'Pencil',      icon: '✒️',  action: onTogglePencil, active: pencilMode,   badge: pencilMode ? 'ON' : 'OFF' },
    { label: 'Hint',        icon: '💡',  action: onHint,         active: false,        badge: '∞' },
  ];

  return (
    <div style={{
      width: '100%', padding: '0 12px',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    }}>
      {actions.map(({ label, icon, action, active, badge }) => (
        <div key={label}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          onClick={action}>
          <div style={{ position: 'relative' }}>
            <div className="btn-action-3d" style={{
              width: 46, height: 46, borderRadius: 14,
              background: active ? theme.btnActionActiveFace : theme.btnActionFace,
              border: `1.5px solid ${active ? theme.btnActionActiveEdge : theme.btnActionEdge}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: active
                ? `0 5px 0 ${theme.btnActionActiveEdge}, 0 6px 12px rgba(0,0,0,0.2)`
                : `0 5px 0 ${theme.btnActionEdge}, 0 6px 12px rgba(0,0,0,0.15)`,
              color: theme.btnActionText,
            }}>{icon}</div>
            {badge && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: badge === 'ON' ? theme.primary : badge === 'OFF' ? theme.textLight : theme.primary,
                color: badge === 'ON' ? theme.white : theme.white,
                fontSize: 8, fontWeight: 800,
                padding: '1px 4px', borderRadius: 6,
                minWidth: 16, textAlign: 'center',
              }}>{badge}</div>
            )}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
