import type { HillSpec } from './dto/hill-spec';
import { seededRandom } from './random';

const HILL_STEP = 8;
const FIRST_WAVE_PERIOD = 190;
const SECOND_WAVE_PERIOD = 83;
const SECOND_WAVE_SHARE = 0.35;
const SECOND_WAVE_PHASE_RATIO = 2.3;
const BLADE_HALF_WIDTH = 2;
const BLADE_HEIGHT_SPREAD = 0.6;
const BLADE_LEAN_SPREAD = 0.7;

export function hillPath(width: number, hill: HillSpec): string {
  const points: string[] = [];
  for (let x = 0; x <= width + HILL_STEP; x += HILL_STEP) {
    points.push(`L${fixed(x)} ${fixed(hillHeight(x, hill))}`);
  }
  return `M0 ${hill.bottomY}${points.join('')}L${fixed(width + HILL_STEP)} ${hill.bottomY}Z`;
}

export function grassPath(
  width: number,
  baseY: number,
  height: number,
  bladeCount: number,
  seed: number,
): string {
  const random = seededRandom(seed);
  const blades: string[] = [];
  for (let index = 0; index < bladeCount; index += 1) {
    const x = (width * (index + random())) / bladeCount;
    const bladeHeight = height * (1 - BLADE_HEIGHT_SPREAD * random());
    const lean = (random() * 2 - 1) * BLADE_LEAN_SPREAD * bladeHeight;
    blades.push(
      `M${fixed(x - BLADE_HALF_WIDTH)} ${fixed(baseY)}L${fixed(x + lean)} ${fixed(baseY - bladeHeight)}L${fixed(x + BLADE_HALF_WIDTH)} ${fixed(baseY)}Z`,
    );
  }
  return blades.join('');
}

function hillHeight(x: number, hill: HillSpec): number {
  const first = Math.sin((2 * Math.PI * x) / FIRST_WAVE_PERIOD + hill.phase);
  const second =
    Math.sin(
      (2 * Math.PI * x) / SECOND_WAVE_PERIOD +
        hill.phase * SECOND_WAVE_PHASE_RATIO,
    ) * SECOND_WAVE_SHARE;
  return hill.baseY - hill.amplitude * (first + second);
}

function fixed(value: number): string {
  return value.toFixed(1);
}
