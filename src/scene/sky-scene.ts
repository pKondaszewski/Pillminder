import type {
  BodyPosition,
  SceneMood,
  SkyPhase,
  SkyScene,
  Star,
  SunTimes,
} from './dto/sky-scene';
import { seededRandom } from './random';
import { SCENE_HORIZON_Y } from './scene-geometry';

const MINUTE_MS = 60 * 1000;
const DAWN_LEAD_MS = 30 * MINUTE_MS;
const DAWN_LENGTH_MS = 90 * MINUTE_MS;
const DUSK_LEAD_MS = 90 * MINUTE_MS;
const DUSK_TAIL_MS = 30 * MINUTE_MS;
const DAY_MS = 24 * 60 * MINUTE_MS;
const BODY_MARGIN_X = 0.12;
const BODY_SPAN_X = 0.76;
const NEUTRAL_DAY_PROGRESS = 0.5;

const STAR_COUNT = 14;
const STAR_SEED = 213;
const STARS_TOP_Y = 24;
const DOME_WIDTH = 318;
const DOME_BASE_Y = 158;
const DOME_RADIUS = 128;
const DOME_MIN_HEIGHT = 18;
const STAR_MIN_RADIUS = 0.9;
const STAR_RADIUS_SPREAD = 1.2;
const STAR_MIN_CYCLES = 8;
const STAR_CYCLE_SPREAD = 9;
const SHOOTING_STAR_MIN_DELAY_MS = 6000;
const SHOOTING_STAR_DELAY_SPREAD_MS = 9000;

export function skyPhase(now: Date, sun: SunTimes): SkyPhase {
  const time = now.getTime();
  const sunrise = sun.sunrise.getTime();
  const sunset = sun.sunset.getTime();
  if (
    time >= sunrise - DAWN_LEAD_MS &&
    time < sunrise - DAWN_LEAD_MS + DAWN_LENGTH_MS
  ) {
    return 'dawn';
  }
  if (time >= sunset - DUSK_LEAD_MS && time < sunset + DUSK_TAIL_MS) {
    return 'dusk';
  }
  return time >= sunrise && time < sunset ? 'day' : 'night';
}

export function skyScene(now: Date, sun: SunTimes, isToday: boolean): SkyScene {
  if (!isToday) {
    return { phase: 'day', body: 'sun', progress: NEUTRAL_DAY_PROGRESS };
  }
  const phase = skyPhase(now, sun);
  const time = now.getTime();
  const sunrise = sun.sunrise.getTime();
  const sunset = sun.sunset.getTime();
  if (time >= sunrise && time < sunset) {
    return {
      phase,
      body: 'sun',
      progress: (time - sunrise) / (sunset - sunrise),
    };
  }
  const nightLength = DAY_MS - (sunset - sunrise);
  const sinceSunset = (time - sunset + DAY_MS) % DAY_MS;
  return {
    phase,
    body: 'moon',
    progress: Math.min(1, sinceSunset / nightLength),
  };
}

export function bodyPosition(progress: number): BodyPosition {
  'worklet';
  return {
    x: BODY_MARGIN_X + BODY_SPAN_X * progress,
    elevation: Math.sin(Math.PI * progress),
  };
}

export function isCelebration(
  previous: SceneMood | null,
  next: SceneMood,
): boolean {
  return previous !== null && previous !== 'done' && next === 'done';
}

export function stars(): Star[] {
  const random = seededRandom(STAR_SEED);
  const result: Star[] = [];
  while (result.length < STAR_COUNT) {
    const x = DOME_WIDTH / 2 + (random() * 2 - 1) * DOME_RADIUS;
    const y = DOME_BASE_Y - random() * DOME_RADIUS;
    if (!isInsideDome(x, y)) continue;
    result.push({
      x: x / DOME_WIDTH,
      y: STARS_TOP_Y + (y / DOME_BASE_Y) * (SCENE_HORIZON_Y - STARS_TOP_Y),
      radius: STAR_MIN_RADIUS + random() * STAR_RADIUS_SPREAD,
      cycles: STAR_MIN_CYCLES + Math.floor(random() * STAR_CYCLE_SPREAD),
      offset: random(),
    });
  }
  return result;
}

export function shootingStarDelayMs(random: number): number {
  return SHOOTING_STAR_MIN_DELAY_MS + random * SHOOTING_STAR_DELAY_SPREAD_MS;
}

function isInsideDome(x: number, y: number): boolean {
  const dx = x - DOME_WIDTH / 2;
  const dy = DOME_BASE_Y - y;
  return dy >= DOME_MIN_HEIGHT && Math.hypot(dx, dy) <= DOME_RADIUS;
}
