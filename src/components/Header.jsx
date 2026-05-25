import C from '../constants/colors.js';

export default function Header({ streak }) {
  return (
    <div style={{
      width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px 4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22, color: C.primary, cursor: 'pointer' }}>←</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>Streak {streak}</span>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        {['☆', '⬡', '🎨', '⚙'].map((icon, i) => (
          <span key={i} style={{ fontSize: 20, color: C.textMuted, cursor: 'pointer' }}>{icon}</span>
        ))}
      </div>
    </div>
  );
}
