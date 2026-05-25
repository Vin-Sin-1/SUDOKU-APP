import { useState, useEffect, useRef } from 'react';

export function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  return { seconds, reset: () => setSeconds(0) };
}

export function fmtTime(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}
