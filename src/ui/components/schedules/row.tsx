import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { courseProgress, type ScheduleKind } from '@/schedules/schedule-list';
import {
  describeCourse,
  describeRhythm,
  type ScheduleListItem,
} from '@/schedules/schedule-service';
import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { formatDate } from '@/ui/commons/format-date';
import { ProductAvatar } from '@/ui/components/commons/product-avatar';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { CourseProgressBar } from '@/ui/components/schedules/course-progress';

type Props = {
  item: ScheduleListItem;
  kind: ScheduleKind;
  now: Date;
  onPress: () => void;
  onResume: () => void;
};

export function ScheduleRow({ item, kind, now, onPress, onResume }: Props) {
  const { t } = useTranslation();
  const progress = courseProgress(item, now);
  const dimmed = kind === 'paused' || kind === 'ended';

  return (
    <ThemedView type="surface" style={styles.card}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
      >
        <View style={[styles.main, dimmed && styles.dimmed]}>
          <ProductAvatar
            category={item.productCategory}
            imageFileName={item.profileImageFileName}
            size={40}
          />
          <View style={styles.text}>
            <ThemedText numberOfLines={1}>{item.productName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {describeRhythm(item, t, formatDate, item.productUnit, now)}
            </ThemedText>
            {kind === 'timed' && item.endDate ? (
              <CourseProgressBar
                progress={progress}
                label={describeCourse(progress, item.endDate, t, formatDate)}
              />
            ) : null}
          </View>
        </View>
      </Pressable>
      {kind === 'paused' ? (
        <Pressable
          onPress={onResume}
          accessibilityRole="button"
          style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {t('schedule.resume')}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
  },
  content: {
    flex: 1,
    padding: Spacing.sixteen,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
  },
  text: {
    flex: 1,
    gap: Spacing.four,
  },
  dimmed: {
    opacity: 0.6,
  },
  resume: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingRight: Spacing.sixteen,
  },
  pressed: {
    opacity: 0.7,
  },
});
