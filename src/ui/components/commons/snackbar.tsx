import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

const AUTO_DISMISS_MS = 5000;

/**
 * Transient bottom bar with a single action, e.g. "taken → Undo". Auto-hides
 * after `duration`. Remount it (change its `key`) to restart the timer for a
 * fresh message.
 */
export function Snackbar({
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = AUTO_DISMISS_MS,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={styles.wrapper}
    >
      <ThemedView type="backgroundSelected" style={styles.bar}>
        <ThemedText type="small">{message}</ThemedText>
        <Pressable
          onPress={onAction}
          hitSlop={Spacing.two}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="smallBold" style={styles.action}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.four,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  action: {
    color: '#3c87f7',
  },
  pressed: {
    opacity: 0.7,
  },
});
