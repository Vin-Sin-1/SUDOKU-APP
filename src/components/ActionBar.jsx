import C from '../constants/colors.js';

export default function ActionBar({
  pencilMode, fastPencilOn,
  onUndo, onErase, onFastPencil, onTogglePencil, onHint,
}) {
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
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: active ? C.primaryPale : C.white,
              border: active ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(46,158,107,0.08)',
            }}>{icon}</div>
            {badge && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: badge === 'ON' ? C.primary : badge === 'OFF' ? C.textLight : C.primary,
                color: C.white, fontSize: 8, fontWeight: 800,
                padding: '1px 4px', borderRadius: 6,
                minWidth: 16, textAlign: 'center',
              }}>{badge}</div>
            )}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
