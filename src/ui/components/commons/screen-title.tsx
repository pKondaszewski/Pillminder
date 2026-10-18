import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

export function ScreenTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <ThemedView style={styles.row}>
      <ThemedText type="title">{title}</ThemedText>
      {action}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_SIZE,
    marginTop: Spacing.sixteen,
  },
});
