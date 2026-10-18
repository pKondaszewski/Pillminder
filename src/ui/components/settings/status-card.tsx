import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { SecondaryButton } from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  ok: boolean;
  title: string;
  status: string;
  fixLabel: string;
  onFix: () => void;
};

export function StatusCard({ ok, title, status, fixLabel, onFix }: Props) {
  const theme = useTheme();

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: ok ? theme.takenCard : theme.overdueCard,
          borderColor: ok ? theme.takenCardBorder : theme.overdueCardBorder,
        },
      ]}
    >
      <ThemedView
        style={[
          styles.dot,
          { backgroundColor: ok ? theme.taken : theme.overdue },
        ]}
      />
      <ThemedView style={styles.texts}>
        <ThemedText type="headline">{title}</ThemedText>
        <ThemedText type="small" themeColor={ok ? 'takenText' : 'overdueText'}>
          {status}
        </ThemedText>
      </ThemedView>
      {ok ? null : (
        <ThemedView style={styles.fix}>
          <SecondaryButton label={fixLabel} onPress={onFix} />
        </ThemedView>
      )}
    </ThemedView>
  );
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
