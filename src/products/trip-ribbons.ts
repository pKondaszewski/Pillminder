import { ROAD_OVERRUN_DAYS } from '@/scene/scene-service';

import type { TravelPlanEntry } from './dto/travel-plan-output';

export const MAX_RIBBON_ROWS = 4;

export interface TripRibbon {
  id: string;
  name: string;
  warning: boolean;
  endDay: number;
  runsOutDay: number | null;
}

export interface TripRibbons {
  ribbons: TripRibbon[];
  hiddenCount: number;
  hiddenAreAllEnough: boolean;
}

export function tripRibbons(
  entries: TravelPlanEntry[],
  tripDays: number,
): TripRibbons {
  const ribbons = entries
    .filter(({ verdict }) => verdict !== null)
    .map((entry) => toRibbon(entry, tripDays))
    .sort(
      (a, b) => Number(b.warning) - Number(a.warning) || a.endDay - b.endDay,
    );
  const hidden = ribbons.slice(MAX_RIBBON_ROWS);
  return {
    ribbons: ribbons.slice(0, MAX_RIBBON_ROWS),
    hiddenCount: hidden.length,
    hiddenAreAllEnough: hidden.every(({ warning }) => !warning),
  };
}

function toRibbon(entry: TravelPlanEntry, tripDays: number): TripRibbon {
  const reach = tripDays + ROAD_OVERRUN_DAYS;
  const runOut = entry.runOutOffsetDays;
  const endDay = Math.max(0, Math.min(runOut ?? reach, reach));
  return {
    id: entry.id,
    name: entry.name,
    warning: entry.verdict !== 'enough',
    endDay,
    runsOutDay:
      entry.verdict === 'runsOutDuringTrip' && runOut !== null ? endDay : null,
  };
}
