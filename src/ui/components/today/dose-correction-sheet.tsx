import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  type CorrectionTarget,
  stockEffectText,
  type TodayDose,
} from '@/doses/dose-service';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

const TARGETS: readonly CorrectionTarget[] = ['taken', 'skipped'];

type Props = {
  dose: TodayDose;
  onClose: () => void;
  onSave: (dose: TodayDose, target: CorrectionTarget) => void;
};

export function DoseCorrectionSheet({ dose, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [target, setTarget] = useState<CorrectionTarget | null>(
    dose.state === 'pending' ? null : dose.state,
  );

  return (
    <BottomSheet
      visible
      title={t('home.correction.title')}
      onClose={onClose}
      onSave={() => (target ? onSave(dose, target) : onClose())}
    >
      <View style={styles.tiles}>
        {TARGETS.map((option) => {
          const selected = option === target;
          return (
            <Pressable
              key={option}
              onPress={() => setTarget(option)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.tile,
                {
                  backgroundColor: selected
                    ? theme.accentSoft
                    : theme.background,
                  borderColor: selected ? theme.accent : theme.borderStrong,
                },
              ]}
            >
              <ThemedText
                type="smallBold"
                themeColor={selected ? 'accent' : 'text'}
              >
                {t(`home.correction.${option}`)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {stockEffectText(dose, option, t)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
  tile: {
    flex: 1,
    gap: Spacing.four,
    padding: Spacing.fourteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
});
