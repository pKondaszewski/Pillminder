import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { DoseRow } from '@/doses/ui/dose-row';

import type { PracticeReminder } from '../dto/practice-reminder';
import { TutorialSkipButton } from './tutorial-skip-button';

const IGNORED = () => {};

export function TutorialPracticeCard({
  reminder,
  onTake,
  onSkip,
}: {
  reminder: PracticeReminder;
  onTake: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { dose, notified } = reminder;
  // one millisecond before the planned time keeps the row from turning overdue
  const rowNow = new Date(dose.plannedAt.getTime() - 1);

  return (
    <ThemedView
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <ThemedText type="smallBold">
        {t(notified ? 'tutorial.practiceMessage' : 'tutorial.practiceInApp', {
          name: dose.productName,
          action: t('notification.take'),
        })}
      </ThemedText>
      <DoseRow
        dose={dose}
        mode="today"
        now={rowNow}
        onTake={onTake}
        onSkip={IGNORED}
        onRevert={IGNORED}
        onCorrect={IGNORED}
        onOpenProduct={IGNORED}
      />
      <ThemedView style={styles.actions}>
        <TutorialSkipButton onSkip={onSkip} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.eight,
    padding: Spacing.twelve,
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
});
