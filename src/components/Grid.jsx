import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function Grid({
  board, given, selected, notes, conflicts,
  pencilMode, pencilNum, won, paused,
  onSelectCell, onStampNote, onResume,
  isHighlighted, isSameNum, lastAction,
}) {
  const { theme } = useTheme();
  const [animCells, setAnimCells] = useState({});

  useEffect(() => {
    if (!lastAction) return;
    const key = `${lastAction.r}-${lastAction.c}`;
    setAnimCells((prev) => ({ ...prev, [key]: lastAction.type }));
    const t = setTimeout(() => {
      setAnimCells((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }, 450);
    return () => clearTimeout(t);
  }, [lastAction?.id]);

  return (
    <div style={{
      width: '100%', maxWidth: '100%',
      aspectRatio: '1/1',
      background: theme.gridBg,
      borderRadius: 0,
      border: 'none',
      overflow: 'hidden',
      margin: 0,
      boxShadow: theme.gridShadow,
      position: 'relative',
    }}>
      {paused ? (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: theme.overlayBg,
        }}>
          <div style={{ fontSize: 40 }}>⏸</div>
          <div style={{ fontWeight: 800, color: theme.primary, fontSize: 18, marginTop: 8 }}>Paused</div>
          <button onClick={onResume} style={{
            marginTop: 16, padding: '10px 28px', background: theme.primary, color: theme.white,
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>Resume</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9,1fr)',
          gridTemplateRows: 'repeat(9,1fr)',
          width: '100%', height: '100%',
        }}>
          {board.map((row, r) => row.map((val, c) => {
            const key       = `${r}-${c}`;
            const isSel     = selected && selected[0] === r && selected[1] === c;
            const isConf    = conflicts.has(key);
            const isHi      = isHighlighted(r, c);
            const isSame    = isSameNum(r, c);
            const isGiven   = given[r][c];
            const cellNotes = notes[key];
            const animType  = animCells[key];

            let bg = theme.cellBg;
            let textColor = theme.textGiven;
            const hasPencilNote = pencilMode && pencilNum && cellNotes && cellNotes.has(pencilNum);
            if (isSel)              { bg = theme.cellSelect; textColor = theme.white; }
            else if (isConf)        { bg = theme.cellConflict; textColor = theme.textConflict; }
            else if (hasPencilNote) { bg = theme.cellSameNum; }
            else if (isSame)        { bg = theme.cellSameNum; textColor = isGiven ? theme.textGiven : theme.textUser; }
            else if (isHi)          { bg = theme.cellHighlight; textColor = isGiven ? theme.textGiven : theme.textUser; }
            else if (!isGiven && val) textColor = theme.textUser;

            const borderRight  = (c + 1) % 3 === 0 && c !== 8 ? `2px solid ${theme.borderBox}` : `1px solid ${theme.border}`;
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? `2px solid ${theme.borderBox}` : `1px solid ${theme.border}`;

            const numColor = theme.numberColors && val
              ? (isGiven ? theme.textGiven : (isSel ? theme.white : theme.numberColors[val]))
              : (isSel ? theme.white : textColor);

            return (
              <div key={key}
                className={animType === 'correct' ? 'cell-pop' : animType === 'wrong' ? 'cell-shake' : undefined}
                style={{
                  background: bg, borderRight, borderBottom,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isGiven ? 'default' : 'pointer',
                  transition: 'background 0.1s',
                  position: 'relative',
                }}
                onClick={() => {
                  if (won || paused) return;
                  if (pencilMode && pencilNum) onStampNote(r, c, pencilNum);
                  else onSelectCell(r, c);
                }}>
                {val ? (
                  <span style={{
                    fontSize: 'clamp(18px,6vw,32px)',
                    fontWeight: isGiven ? 800 : 600,
                    color: numColor,
                    lineHeight: 1,
                  }}>{val}</span>
                ) : (cellNotes && cellNotes.size > 0) ? (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                    width: '90%', height: '90%',
                    fontSize: 'clamp(8px,2.2vw,13px)',
                    color: isSel ? `${theme.white}dd` : theme.textNote,
                    fontWeight: 700, textAlign: 'center', lineHeight: '1.5',
                  }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <span key={n} style={{ opacity: cellNotes.has(n) ? 1 : 0 }}>{n}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
}
