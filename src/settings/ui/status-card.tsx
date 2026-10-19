import { StyleSheet } from 'react-native';

import { SecondaryButton } from '@/commons/ui/button';
import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

const TEXT_MIN_WIDTH = 140;

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
        <SecondaryButton fitContent label={fixLabel} onPress={onFix} />
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
    flexWrap: 'wrap',
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
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: TEXT_MIN_WIDTH,
    backgroundColor: 'transparent',
  },
});
