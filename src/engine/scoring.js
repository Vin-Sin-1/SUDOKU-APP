export function calcScore(timeSeconds, difficulty, mistakes) {
  const base = { easy: 5000, medium: 8000, hard: 12000, expert: 18000 }[difficulty] ?? 8000;
  const timePenalty = timeSeconds * 3;
  const mistakePenalty = mistakes * 500;
  return Math.max(0, base - timePenalty - mistakePenalty);
}
