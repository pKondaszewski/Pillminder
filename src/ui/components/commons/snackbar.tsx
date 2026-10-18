import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

const AUTO_DISMISS_MS = 5000;

// Remount it (change its key) to restart the auto-dismiss timer.
export function Snackbar({
  message,
  actionLabel,
  onAction,
  onDismiss,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={styles.wrapper}
    >
      <ThemedView type="surface" style={styles.bar}>
        <ThemedText type="small" style={styles.message}>
          {message}
        </ThemedText>
        <Pressable
          onPress={onAction}
          hitSlop={Spacing.eight}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {actionLabel}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          hitSlop={Spacing.eight}
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
    left: Spacing.twentyFour,
    right: Spacing.twentyFour,
    bottom: Spacing.twentyFour,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sixteen,
    paddingVertical: Spacing.sixteen,
    paddingHorizontal: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
  },
  message: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
