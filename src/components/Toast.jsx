import { useTheme } from '../contexts/ThemeContext.jsx';

export default function Toast({ toast }) {
  const { theme } = useTheme();
  if (!toast) return null;

  return (
    <div key={toast.id} style={{
      position: 'fixed',
      top: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: theme.toastBg,
      color: theme.toastText,
      padding: '12px 28px',
      borderRadius: 30,
      fontWeight: 800,
      fontSize: 15,
      zIndex: 300,
      boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
      whiteSpace: 'nowrap',
      animation: 'toastIn 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both',
      letterSpacing: 0.2,
    }}>
      {toast.message}
    </div>
  );
}
