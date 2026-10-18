import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

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
  const theme = useTheme();
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={styles.wrapper}
    >
      <View style={[styles.pill, { backgroundColor: theme.snackbar }]}>
        <Icon name="check_circle" size={20} color={theme.snackbarIcon} />
        <ThemedText
          type="small"
          style={[styles.message, { color: theme.onSnackbar }]}
          numberOfLines={1}
        >
          {message}
        </ThemedText>
        <Pressable
          onPress={onAction}
          hitSlop={Spacing.eight}
          accessibilityRole="button"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="smallBold" style={{ color: theme.snackbarAction }}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.twenty,
    right: Spacing.twenty,
    bottom: Spacing.sixteen,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    paddingVertical: Spacing.twelve,
    paddingHorizontal: Spacing.sixteen,
    borderRadius: Radius.pill,
  },
  message: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
