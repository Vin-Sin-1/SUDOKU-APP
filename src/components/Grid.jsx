import C from '../constants/colors.js';

export default function Grid({
  board, given, selected, notes, conflicts,
  pencilMode, pencilNum, won, paused,
  onSelectCell, onStampNote, onResume,
  isHighlighted, isSameNum,
}) {
  return (
    <div style={{
      width: '100%', maxWidth: '100%',
      aspectRatio: '1/1',
      background: C.gridBg,
      borderRadius: 0,
      border: 'none',
      overflow: 'hidden',
      margin: 0,
      boxShadow: '0 4px 20px rgba(46,158,107,0.1)',
      position: 'relative',
    }}>
      {paused ? (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(232,245,239,0.95)',
        }}>
          <div style={{ fontSize: 40 }}>⏸</div>
          <div style={{ fontWeight: 800, color: C.primary, fontSize: 18, marginTop: 8 }}>Paused</div>
          <button onClick={onResume} style={{
            marginTop: 16, padding: '10px 28px', background: C.primary, color: C.white,
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
            const key      = `${r}-${c}`;
            const isSel    = selected && selected[0] === r && selected[1] === c;
            const isConf   = conflicts.has(key);
            const isHi     = isHighlighted(r, c);
            const isSame   = isSameNum(r, c);
            const isGiven  = given[r][c];
            const cellNotes = notes[key];

            let bg = C.cellBg;
            let textColor = C.given;
            const hasPencilNote = pencilMode && pencilNum && cellNotes && cellNotes.has(pencilNum);
            if (isSel)             { bg = C.cellSelect; textColor = C.white; }
            else if (isConf)       { bg = C.cellConflict; textColor = C.conflict; }
            else if (hasPencilNote){ bg = '#d0f0e0'; }
            else if (isSame)       { bg = C.cellSameNum; textColor = isGiven ? C.given : C.userNum; }
            else if (isHi)         { bg = C.cellHover; textColor = isGiven ? C.given : C.userNum; }
            else if (!isGiven && val) textColor = C.userNum;

            const borderRight  = (c + 1) % 3 === 0 && c !== 8 ? `2px solid ${C.borderBox}` : `1px solid ${C.border}`;
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? `2px solid ${C.borderBox}` : `1px solid ${C.border}`;

            return (
              <div key={key}
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
                    color: isSel ? C.white : textColor,
                    lineHeight: 1,
                  }}>{val}</span>
                ) : (cellNotes && cellNotes.size > 0) ? (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                    width: '90%', height: '90%',
                    fontSize: 'clamp(8px,2.2vw,13px)',
                    color: isSel ? 'rgba(255,255,255,0.9)' : C.note,
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
