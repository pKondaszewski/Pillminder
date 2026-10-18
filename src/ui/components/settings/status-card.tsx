import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { SecondaryButton } from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  ok: boolean;
  neutral?: boolean;
  title: string;
  status: string;
  fixLabel?: string;
  onFix?: () => void;
};

export function StatusCard({
  ok,
  neutral = false,
  title,
  status,
  fixLabel,
  onFix,
}: Props) {
  const theme = useTheme();
  const palette = cardPalette(theme, ok, neutral);

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
    >
      <ThemedView style={[styles.dot, { backgroundColor: palette.dot }]} />
      <ThemedView style={styles.texts}>
        <ThemedText type="headline">{title}</ThemedText>
        <ThemedText type="small" themeColor={palette.text}>
          {status}
        </ThemedText>
      </ThemedView>
      {onFix && fixLabel ? (
        <ThemedView style={styles.fix}>
          <SecondaryButton label={fixLabel} onPress={onFix} />
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

function cardPalette(
  theme: ReturnType<typeof useTheme>,
  ok: boolean,
  neutral: boolean,
) {
  if (neutral) {
    return {
      card: theme.surface,
      border: theme.border,
      dot: theme.skipped,
      text: 'textSecondary' as const,
    };
  }
  if (ok) {
    return {
      card: theme.takenCard,
      border: theme.takenCardBorder,
      dot: theme.taken,
      text: 'takenText' as const,
    };
  }
  return {
    card: theme.overdueCard,
    border: theme.overdueCardBorder,
    dot: theme.overdue,
    text: 'overdueText' as const,
  };
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    padding: Spacing.fourteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
  },
  texts: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fix: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
});
