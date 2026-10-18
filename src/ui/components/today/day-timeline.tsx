import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { type TimelineMark } from '@/doses/dose-service';
import { FontFamily } from '@/ui/commons/constants/fonts';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TimelineDot } from '@/ui/components/today/timeline-dot';

const AXIS_TICKS = ['06', '12', '18', '24'];
const TRACK_HEIGHT = 28;
const LINE_HEIGHT = 2;
const NOW_MARKER_WIDTH = 2;
const NOW_LABEL_WIDTH = 48;

type Props = {
  marks: TimelineMark[];
  nowPosition: number | null;
};

export function DayTimeline({ marks, nowPosition }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {nowPosition !== null ? (
        <View style={styles.nowLabelRow}>
          <ThemedText
            type="caption"
            themeColor="accent"
            style={[styles.nowLabel, { left: percent(nowPosition) }]}
          >
            {t('home.timeline.now')}
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.track}>
        <ThemedView type="divider" style={styles.line} />
        {nowPosition !== null ? (
          <ThemedView
            type="borderStrong"
            style={[styles.elapsedLine, { width: percent(nowPosition) }]}
          />
        ) : null}
        {nowPosition !== null ? (
          <ThemedView
            type="accent"
            style={[styles.nowMarker, { left: percent(nowPosition) }]}
          />
        ) : null}
        {marks.map((mark) => (
          <View
            key={mark.id}
            style={[styles.mark, { left: percent(mark.position) }]}
          >
            <TimelineDot statuses={mark.statuses} count={mark.count} />
          </View>
        ))}
      </View>
      <View style={styles.ticks}>
        {AXIS_TICKS.map((tick) => (
          <ThemedText key={tick} type="caption" style={styles.tick}>
            {tick}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

function percent(position: number): `${number}%` {
  return `${position * 100}%`;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  nowLabelRow: {
    height: 16,
  },
  nowLabel: {
    position: 'absolute',
    width: NOW_LABEL_WIDTH,
    marginLeft: -NOW_LABEL_WIDTH / 2,
    textAlign: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (TRACK_HEIGHT - LINE_HEIGHT) / 2,
    height: LINE_HEIGHT,
  },
  elapsedLine: {
    position: 'absolute',
    left: 0,
    top: (TRACK_HEIGHT - LINE_HEIGHT) / 2,
    height: LINE_HEIGHT,
  },
  nowMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: NOW_MARKER_WIDTH,
    marginLeft: -NOW_MARKER_WIDTH / 2,
  },
  mark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tick: {
    fontFamily: FontFamily.mono,
  },
});
