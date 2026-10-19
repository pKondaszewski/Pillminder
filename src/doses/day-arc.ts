import type {
  ArcPoint,
  AxisTick,
  DaySymbol,
  SkyTone,
} from './dto/day-arc-output';
import type { DayPhases } from './dto/day-phases';
import type { TodayCardState } from './dto/today-card-state';

export const ARC_WIDTH = 318;
export const ARC_HEIGHT = 176;
export const ARC_HORIZON_Y = 158;
export const ARC_RADIUS = 140;

const ARC_CENTER_X = ARC_WIDTH / 2;
const FULL_CIRCLE_SLICES = 1;
const TICK_LABEL_GAP = 16;
const TICK_BASELINE_SHIFT = 4;
const TICK_BELOW_HORIZON = 15;

export function arcPoint(position: number): ArcPoint {
  const angle = Math.PI * (1 - position);
  return {
    x: ARC_CENTER_X + ARC_RADIUS * Math.cos(angle),
    y: ARC_HORIZON_Y - ARC_RADIUS * Math.sin(angle),
  };
}

export function arcPath(from: number, to: number): string {
  const start = arcPoint(from);
  const end = arcPoint(to);
  return `M${fixed(start.x)} ${fixed(start.y)}A${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${fixed(end.x)} ${fixed(end.y)}`;
}

export function skyPath(nowPosition: number): string {
  const now = arcPoint(nowPosition);
  const start = arcPoint(0);
  return `M${fixed(start.x)} ${ARC_HORIZON_Y}A${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${fixed(now.x)} ${fixed(now.y)}L${fixed(now.x)} ${ARC_HORIZON_Y}Z`;
}

export function pieSlicePath(
  center: ArcPoint,
  radius: number,
  index: number,
  count: number,
): string {
  const { x, y } = center;
  if (count === FULL_CIRCLE_SLICES) {
    return `M${fixed(x - radius)} ${fixed(y)}a${fixed(radius)} ${fixed(radius)} 0 1 0 ${fixed(2 * radius)} 0a${fixed(radius)} ${fixed(radius)} 0 1 0 ${fixed(-2 * radius)} 0`;
  }
  const startAngle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  const endAngle = -Math.PI / 2 + (2 * Math.PI * (index + 1)) / count;
  const edge = (angle: number) =>
    `${fixed(x + radius * Math.cos(angle))} ${fixed(y + radius * Math.sin(angle))}`;
  return `M${fixed(x)} ${fixed(y)}L${edge(startAngle)}A${fixed(radius)} ${fixed(radius)} 0 0 1 ${edge(endAngle)}Z`;
}

export function axisTicks(): AxisTick[] {
  const labelPoint = (position: number) => {
    const angle = Math.PI * (1 - position);
    const distance = ARC_RADIUS + TICK_LABEL_GAP;
    return {
      x: ARC_CENTER_X + distance * Math.cos(angle),
      y: ARC_HORIZON_Y - distance * Math.sin(angle) + TICK_BASELINE_SHIFT,
    };
  };
  return [
    {
      label: '06',
      x: 0,
      y: ARC_HORIZON_Y + TICK_BELOW_HORIZON,
      anchor: 'start',
    },
    { label: '12', ...labelPoint(1 / 3), anchor: 'middle' },
    { label: '18', ...labelPoint(2 / 3), anchor: 'middle' },
    {
      label: '24',
      x: ARC_WIDTH,
      y: ARC_HORIZON_Y + TICK_BELOW_HORIZON,
      anchor: 'end',
    },
  ];
}

export function daySymbol(now: Date, phases: DayPhases): DaySymbol {
  const time = now.getTime();
  if (time >= phases.sunset.getTime() || time < phases.sunrise.getTime()) {
    return 'moon';
  }
  return time < phases.noon.getTime() ? 'risingSun' : 'sun';
}

export function skyTone(
  state: TodayCardState,
  symbol: DaySymbol | null,
): SkyTone | null {
  if (symbol === null) return null;
  if (state.kind === 'overdue') return 'overdue';
  if (state.kind === 'done') return 'done';
  return symbol === 'moon' ? 'night' : 'day';
}

function fixed(value: number): string {
  return value.toFixed(1);
}
