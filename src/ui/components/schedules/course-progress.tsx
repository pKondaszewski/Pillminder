import { StyleSheet } from 'react-native';

import type { CourseProgress } from '@/schedules/schedule-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  progress: CourseProgress | null;
  label: string;
};

export function CourseProgressBar({ progress, label }: Props) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView type="divider" style={styles.track}>
        <ThemedView
          type="accent"
          style={{
            width: `${progress ? (progress.day / progress.total) * 100 : 0}%`,
            height: '100%',
          }}
        />
      </ThemedView>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
});
