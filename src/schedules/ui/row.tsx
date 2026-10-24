import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/commons/ui/constants/theme';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import {
  useFirstWeekday,
  useFormatDate,
  useFormatTime,
} from '@/commons/ui/use-format-date';
import {
  courseProgress,
  scheduleProductLabel,
} from '@/schedules/schedule-list';
import {
  describeCourse,
  describeRhythm,
  type ScheduleKind,
  type ScheduleListItem,
} from '@/schedules/schedule-service';
import { CourseProgressBar } from '@/schedules/ui/course-progress';

type Props = {
  item: ScheduleListItem;
  kind: ScheduleKind;
  now: Date;
  onPress: () => void;
  onResume: () => void;
  onRestoreProduct: () => void;
};

export function ScheduleRow({
  item,
  kind,
  now,
  onPress,
  onResume,
  onRestoreProduct,
}: Props) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const { formatTimes } = useFormatTime();
  const firstWeekday = useFirstWeekday();
  const progress = courseProgress(item, now);
  const productArchived = item.productStatus === 'archived';
  const dimmed = kind === 'paused' || kind === 'ended';
  const pausedAction = productArchived
    ? { labelKey: 'schedule.restoreProduct', onPress: onRestoreProduct }
    : { labelKey: 'schedule.resume', onPress: onResume };

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
            <ThemedText numberOfLines={1}>
              {scheduleProductLabel(item)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {describeRhythm(
                item,
                t,
                formatDate,
                item.productUnit,
                now,
                formatTimes,
                firstWeekday,
              )}
            </ThemedText>
            {productArchived ? (
              <ThemedText type="small" themeColor="textSecondary">
                {t('schedule.productArchived')}
              </ThemedText>
            ) : null}
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
          onPress={pausedAction.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {t(pausedAction.labelKey)}
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
