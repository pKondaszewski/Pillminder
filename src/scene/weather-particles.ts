import type { Particle } from './dto/particle';
import { seededRandom } from './random';

const MIN_CYCLES = 2;
const CYCLE_SPREAD = 4;

export function makeParticles(seed: number, count: number): Particle[] {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    size: random(),
    cycles: MIN_CYCLES + Math.floor(random() * CYCLE_SPREAD),
    offset: random(),
  }));
}
