import {
  Canvas,
  Group,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  type SharedValue,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import {
  roadAxis,
  sceneColors,
  type Season,
  type SkyScene,
  withAlpha,
} from '@/scene/scene-service';
import { LandscapeLayer } from '@/scene/ui/landscape-layer';
import { SceneCar } from '@/scene/ui/scene-car';
import { SceneCelestial } from '@/scene/ui/scene-celestial';
import { SceneClouds } from '@/scene/ui/scene-clouds';
import { SceneNightSky } from '@/scene/ui/scene-night-sky';
import { SceneRoad } from '@/scene/ui/scene-road';
import { SceneWeather } from '@/scene/ui/scene-weather';
import { useBlendedColors } from '@/scene/ui/use-blended-colors';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const FADE_HEIGHT = 12;

type Props = {
  scene: SkyScene;
  season: Season;
  tripDays: number;
  height: number;
  time: SharedValue<number>;
  entry: SharedValue<number>;
  active: boolean;
  reduceMotion: boolean;
};

export function RoadScene({
  scene,
  season,
  tripDays,
  height,
  time,
  entry,
  active,
  reduceMotion,
}: Props) {
  const theme = useTheme();
  const palette = useScenePalette();
  const { width } = useWindowDimensions();
  const colors = useBlendedColors(
    sceneColors(palette, season, scene.phase, 'calm'),
  );
  const sky = useDerivedValue(() => colors.value.slice(0, 2));
  const burst = useSharedValue(0);
  const axis = roadAxis(width, tripDays);
  const fadeTop = height - FADE_HEIGHT;

  return (
    <Canvas pointerEvents="none" style={[styles.canvas, { height }]}>
      <Group>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={sky} />
        </Rect>
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
          height={height}
        />
        <SceneRoad width={width} axis={axis} tripDays={tripDays} time={time} />
        <SceneCar
          width={width}
          axis={axis}
          tripDays={tripDays}
          time={time}
          entry={entry}
        />
        {reduceMotion ? null : (
          <SceneWeather
            season={season}
            phase={scene.phase}
            width={width}
            time={time}
          />
        )}
        <Rect x={0} y={fadeTop} width={width} height={FADE_HEIGHT + 1}>
          <LinearGradient
            start={vec(0, fadeTop)}
            end={vec(0, height)}
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
