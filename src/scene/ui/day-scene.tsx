import {
  Canvas,
  Group,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import {
  type MeadowMark,
  SCENE_FADE_HEIGHT,
  SCENE_FADE_SHIFT,
  SCENE_HEIGHT,
  sceneColors,
  type SceneMood,
  type Season,
  type SkyScene,
  withAlpha,
} from '@/scene/scene-service';
import { LandscapeLayer } from '@/scene/ui/landscape-layer';
import { SceneCelebrationWave } from '@/scene/ui/scene-celebration-wave';
import { SceneCelestial } from '@/scene/ui/scene-celestial';
import { SceneClouds } from '@/scene/ui/scene-clouds';
import { SceneMeadow } from '@/scene/ui/scene-meadow';
import { SceneNightSky } from '@/scene/ui/scene-night-sky';
import { SceneWarningBreath } from '@/scene/ui/scene-warning-breath';
import { SceneWeather } from '@/scene/ui/scene-weather';
import { useBlendedColors } from '@/scene/ui/use-blended-colors';
import { useCelebrationProgress } from '@/scene/ui/use-celebration-progress';
import { useEntryProgress } from '@/scene/ui/use-entry-progress';
import { useMeadowEvents } from '@/scene/ui/use-meadow-events';
import { useSceneClock } from '@/scene/ui/use-scene-clock';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

type Props = {
  scene: SkyScene;
  mood: SceneMood;
  season: Season;
  marks: MeadowMark[];
  nowPosition: number | null;
  celebrationKey: number;
  replayKey: string;
  topInset: number;
};

export function DayScene({
  scene,
  mood,
  season,
  marks,
  nowPosition,
  celebrationKey,
  replayKey,
  topInset,
}: Props) {
  const theme = useTheme();
  const palette = useScenePalette();
  const { width } = useWindowDimensions();
  const { time, active, reduceMotion } = useSceneClock();
  const entry = useEntryProgress(replayKey);
  const burst = useCelebrationProgress(celebrationKey, reduceMotion);
  const events = useMeadowEvents(marks);
  const colors = useBlendedColors(
    sceneColors(palette, season, scene.phase, mood),
  );
  const sky = useDerivedValue(() => colors.value.slice(0, 2));
  const fadeTop = SCENE_HEIGHT - SCENE_FADE_HEIGHT + SCENE_FADE_SHIFT;

  return (
    <Canvas
      pointerEvents="none"
      style={[styles.canvas, { height: SCENE_HEIGHT + topInset }]}
    >
      <Group transform={[{ translateY: topInset }]}>
        <Rect
          x={0}
          y={-topInset}
          width={width}
          height={SCENE_HEIGHT + topInset}
        >
          <LinearGradient
            start={vec(0, -topInset)}
            end={vec(0, SCENE_HEIGHT)}
            colors={sky}
          />
        </Rect>
        {mood === 'overdue' ? (
          <SceneWarningBreath width={width} topInset={topInset} time={time} />
        ) : null}
        {scene.phase === 'night' ? (
          <SceneNightSky
            width={width}
            time={time}
            entry={entry}
            shootingStars={active}
          />
        ) : (
          <SceneClouds width={width} time={time} entry={entry} />
        )}
        <SceneCelestial
          scene={scene}
          width={width}
          entry={entry}
          time={time}
          burst={burst}
        />
        <LandscapeLayer
          width={width}
          season={season}
          time={time}
          colors={colors}
        />
        <SceneMeadow
          marks={marks}
          events={events}
          nowPosition={nowPosition}
          season={season}
          phase={scene.phase}
          width={width}
          entry={entry}
          time={time}
        />
        {reduceMotion ? null : (
          <SceneWeather
            season={season}
            phase={scene.phase}
            width={width}
            time={time}
          />
        )}
        <SceneCelebrationWave width={width} topInset={topInset} burst={burst} />
        <Rect
          x={0}
          y={fadeTop}
          width={width}
          height={SCENE_HEIGHT - fadeTop + 1}
        >
          <LinearGradient
            start={vec(0, fadeTop)}
            end={vec(0, SCENE_HEIGHT)}
            colors={[withAlpha(theme.background, 0), theme.background]}
          />
        </Rect>
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
