import type { AndroidSymbol } from 'expo-symbols';
import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { PrimaryButton } from '@/ui/components/commons/button';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  icon: AndroidSymbol;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: Props) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedView type="surface" style={styles.tile}>
        <Icon name={icon} size={32} color={theme.textTertiary} />
      </ThemedView>
      <ThemedText type="headline">{title}</ThemedText>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.message}
      >
        {message}
      </ThemedText>
      <ThemedView style={styles.action}>
        <PrimaryButton label={actionLabel} onPress={onAction} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.twelve,
    padding: Spacing.twentyFour,
  },
  tile: {
    width: 72,
    height: 72,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
  },
  action: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: Spacing.eight,
  },
});
