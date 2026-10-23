import { StyleSheet } from 'react-native';

import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';

export function PhotoCountBadge({ count }: { count: number }) {
  return (
    <ThemedView type="accent" style={styles.badge}>
      <ThemedText type="caption" themeColor="onAccent">
        {count}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -Spacing.four,
    bottom: -Spacing.four,
    minWidth: 22,
    height: 22,
    paddingHorizontal: Spacing.four,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
