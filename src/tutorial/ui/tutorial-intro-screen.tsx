import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { PrimaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useNow } from '@/commons/ui/use-now';
import { dayPhases } from '@/doses/dose-service';
import { useSunCoords } from '@/location/ui/use-sun-coords';
import { MEADOW_BOTTOM, seasonOf, skyScene } from '@/scene/scene-service';
import { DayScene } from '@/scene/ui/day-scene';

import { TutorialSkipButton } from './tutorial-skip-button';

export function TutorialIntroScreen({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const now = useNow();
  const coords = useSunCoords();
  const { top: topInset } = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <DayScene
        scene={skyScene(now, dayPhases(now, coords), true)}
        mood="calm"
        season={seasonOf(now, coords?.latitude ?? null)}
        marks={[]}
        nowPosition={null}
        celebrationKey={0}
        replayKey="tutorial"
        topInset={topInset}
      />
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={[styles.body, { paddingTop: MEADOW_BOTTOM }]}>
          <ThemedText type="title">{t('tutorial.introTitle')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('tutorial.introMessage')}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.actions}>
          <ThemedView style={styles.primary}>
            <PrimaryButton
              label={t('tutorial.addFirstProduct')}
              onPress={onStart}
            />
          </ThemedView>
          <TutorialSkipButton onSkip={onSkip} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.twentyFour,
    paddingVertical: Spacing.twentyFour,
  },
  body: { gap: Spacing.sixteen },
  actions: { gap: Spacing.eight },
  primary: { flexDirection: 'row' },
});
