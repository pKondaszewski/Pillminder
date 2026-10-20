import type { SharedValue } from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';

import type {
  MeadowEvent,
  MeadowMark,
  Season,
  SkyPhase,
} from '@/scene/scene-service';
import { SceneBasket } from '@/scene/ui/scene-basket';
import { SceneCreature } from '@/scene/ui/scene-creature';
import { MeadowEventEffect } from '@/scene/ui/scene-meadow-events';
import { MeadowPlant } from '@/scene/ui/scene-plant';

const PULSE_CYCLES = 24;
const TWO_PI = 2 * Math.PI;

type Props = {
  marks: MeadowMark[];
  events: MeadowEvent[];
  nowPosition: number | null;
  season: Season;
  phase: SkyPhase;
  width: number;
  entry: SharedValue<number>;
  time: SharedValue<number>;
};

export function SceneMeadow({
  marks,
  events,
  nowPosition,
  season,
  phase,
  width,
  entry,
  time,
}: Props) {
  const wave = useDerivedValue(() =>
    Math.sin(TWO_PI * time.value * PULSE_CYCLES),
  );
  const collected = marks.reduce((sum, mark) => sum + mark.taken, 0);

  return (
    <>
      {nowPosition !== null ? (
        <SceneCreature
          season={season}
          asleep={phase === 'night'}
          position={nowPosition}
          width={width}
          entry={entry}
          time={time}
        />
      ) : null}
      <SceneBasket width={width} collected={collected} />
      {marks.map((mark, index) => (
        <MeadowPlant
          key={mark.id}
          mark={mark}
          index={index}
          season={season}
          width={width}
          entry={entry}
          wave={wave}
        />
      ))}
      {events.map((event) => {
        const index = marks.findIndex((mark) => mark.id === event.markId);
        return index < 0 ? null : (
          <MeadowEventEffect
            key={event.key}
            event={event}
            mark={marks[index]}
            index={index}
            season={season}
            width={width}
            wave={wave}
          />
        );
      })}
    </>
  );
}
