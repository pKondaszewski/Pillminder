const FULL_TURN = 2 * Math.PI;
const SPIKE_STEPS = 8;
const SPIKE_BASE_Y = 2;
const SPIKE_SHORT = 6.5;
const SPIKE_LONG = 8.5;
const SPIKE_HALF_WIDTH = 9;

export function leafPath(length: number): string {
  return `M0 0Q${length * 0.5} ${-length * 0.28} ${length} 0Q${length * 0.5} ${length * 0.18} 0 0Z`;
}

export function ellipsePath(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
): string {
  const left = `${centerX - radiusX} ${centerY}`;
  const arc = `A${radiusX} ${radiusY} 0 1 0`;
  return `M${left}${arc} ${centerX + radiusX} ${centerY}${arc} ${left}Z`;
}

export function ellipseRing(
  count: number,
  distance: number,
  radiusX: number,
  radiusY: number,
  phase = 0,
): string {
  return Array.from({ length: count }, (_, index) => {
    const angle = (FULL_TURN * (index + phase)) / count;
    const degrees = (angle * 180) / Math.PI;
    const centerX = Math.cos(angle) * distance;
    const centerY = Math.sin(angle) * distance;
    const dx = Math.cos(angle) * radiusX;
    const dy = Math.sin(angle) * radiusX;
    const arc = `A${radiusX} ${radiusY} ${degrees.toFixed(1)} 1 0`;
    return `M${(centerX - dx).toFixed(2)} ${(centerY - dy).toFixed(2)}${arc} ${(centerX + dx).toFixed(2)} ${(centerY + dy).toFixed(2)}${arc} ${(centerX - dx).toFixed(2)} ${(centerY - dy).toFixed(2)}Z`;
  }).join('');
}

export function spikePath(): string {
  const points = Array.from({ length: SPIKE_STEPS + 1 }, (_, index) => {
    const angle = Math.PI + (Math.PI * index) / SPIKE_STEPS;
    const radius = index % 2 ? SPIKE_LONG : SPIKE_SHORT;
    const x = Math.cos(angle) * radius;
    const y = SPIKE_BASE_Y + Math.sin(angle) * radius;
    return `L${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `M${-SPIKE_HALF_WIDTH} ${SPIKE_BASE_Y}${points.join('')}L${SPIKE_HALF_WIDTH} ${SPIKE_BASE_Y}Z`;
}
