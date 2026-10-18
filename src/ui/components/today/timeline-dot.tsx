import { StyleSheet, View } from 'react-native';

import type { DoseStatus } from '@/doses/dose-service';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

const SINGLE_SIZE = 12;
const PIE_SIZE = 20;
const COUNT_SIZE = 24;
const FULL_TURN = 360;
const HALF_TURN = 180;

type Props = {
  statuses: DoseStatus[];
  count: number | null;
};

export function TimelineDot({ statuses, count }: Props) {
  const theme = useTheme();
  const colors = statuses.map((status) => theme[status]);

  if (count !== null) {
    return (
      <CountDot
        color={colors[0]}
        count={count}
        planned={statuses[0] === 'planned'}
      />
    );
  }
  if (colors.length > 1) return <PieDot colors={colors} />;
  if (statuses[0] === 'planned') {
    return <View style={[styles.ring, { borderColor: colors[0] }]} />;
  }
  return <View style={[styles.single, { backgroundColor: colors[0] }]} />;
}

function CountDot({
  color,
  count,
  planned,
}: {
  color: string;
  count: number;
  planned: boolean;
}) {
  return (
    <View style={[styles.count, { backgroundColor: color }]}>
      <ThemedText type="caption" themeColor={planned ? 'text' : 'onAccent'}>
        {count}
      </ThemedText>
    </View>
  );
}

function PieDot({ colors }: { colors: string[] }) {
  const sweep = FULL_TURN / colors.length;

  return (
    <View style={[styles.pie, { backgroundColor: colors[0] }]}>
      {colors.slice(1).map((color, index) => (
        <PieSlice
          key={index}
          color={color}
          startAngle={sweep * (index + 1)}
          sweep={sweep}
        />
      ))}
    </View>
  );
}

// A slice is the intersection of two half planes: the clip keeps the right half
// of the dot, the rotated half disc inside it ends exactly `sweep` degrees later.
function PieSlice({
  color,
  startAngle,
  sweep,
}: {
  color: string;
  startAngle: number;
  sweep: number;
}) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ rotate: `${startAngle}deg` }] },
      ]}
    >
      <View style={styles.clip}>
        <View
          style={[
            styles.disc,
            { transform: [{ rotate: `${sweep - HALF_TURN}deg` }] },
          ]}
        >
          <View style={[styles.half, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  single: {
    width: SINGLE_SIZE,
    height: SINGLE_SIZE,
    borderRadius: SINGLE_SIZE / 2,
  },
  ring: {
    width: SINGLE_SIZE,
    height: SINGLE_SIZE,
    borderRadius: SINGLE_SIZE / 2,
    borderWidth: 2,
  },
  count: {
    width: COUNT_SIZE,
    height: COUNT_SIZE,
    borderRadius: COUNT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pie: {
    width: PIE_SIZE,
    height: PIE_SIZE,
    borderRadius: PIE_SIZE / 2,
    overflow: 'hidden',
  },
  clip: {
    position: 'absolute',
    left: PIE_SIZE / 2,
    width: PIE_SIZE / 2,
    height: PIE_SIZE,
    overflow: 'hidden',
  },
  disc: {
    position: 'absolute',
    left: -PIE_SIZE / 2,
    width: PIE_SIZE,
    height: PIE_SIZE,
  },
  half: {
    position: 'absolute',
    left: PIE_SIZE / 2,
    width: PIE_SIZE / 2,
    height: PIE_SIZE,
  },
});
