export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const SECTOR_ANGLE = 360 / LETTERS.length;
export const SPIN_DURATION_MS = 3600;
export const LETTER_RING_FACTOR = 0.43;

export function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function randomIndex(max, rng = Math.random) {
  return Math.floor(rng() * max);
}

export function centerAngleForIndex(index) {
  return index * SECTOR_ANGLE;
}

export function normalizeAngle(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function computeLetterRadius(wheelWidth, minRadius = 118) {
  return Math.max(minRadius, Math.round(wheelWidth * LETTER_RING_FACTOR));
}

export function computeSpinTargetRotation({
  currentRotation,
  targetIndex,
  extraSpins,
}) {
  const targetCenterAngle = centerAngleForIndex(targetIndex);
  const desiredRotation = normalizeAngle(360 - targetCenterAngle);
  const deltaToTarget = normalizeAngle(desiredRotation - currentRotation);
  return currentRotation + extraSpins * 360 + deltaToTarget;
}

export function isFinalCountdown(timeLeft) {
  return timeLeft > 0 && timeLeft <= 10;
}
