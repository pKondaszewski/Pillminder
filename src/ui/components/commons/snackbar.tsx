import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

const AUTO_DISMISS_MS = 5000;

/**
 * Transient bottom bar with a single action, e.g. "taken → Undo", plus a close
 * button. Auto-hides after `duration`. Remount it (change its `key`) to restart
 * the timer for a fresh message.
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
  const { t } = useTranslation();

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
        <ThemedText type="small" style={styles.message}>
          {message}
        </ThemedText>
        <Pressable
          onPress={onAction}
          hitSlop={Spacing.two}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="smallBold" style={styles.action}>
            {actionLabel}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          hitSlop={Spacing.two}
          accessibilityLabel={t('editor.close')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="small" themeColor="textSecondary">
            ✕
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
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  message: {
    flex: 1,
  },
  action: {
    color: '#3c87f7',
  },
  pressed: {
    opacity: 0.7,
  },
});
