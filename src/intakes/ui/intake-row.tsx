import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { doseQuantityText } from '@/doses/dose-service';
import type { Intake } from '@/intakes/intake-service';
import { AsNeededMark } from '@/intakes/ui/as-needed-mark';

type Props = {
  intake: Intake;
  onPress: (intake: Intake) => void;
};

export function IntakeRow({ intake, onPress }: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const quantity = doseQuantityText(intake.quantity, intake.unit, t);

  return (
    <Pressable
      onPress={() => onPress(intake)}
      accessibilityRole="button"
      accessibilityHint={t('intake.rowHint')}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView style={styles.row}>
        <ProductAvatar
          category={intake.category}
          size={36}
          imageFileName={intake.profileImageFileName}
        />
        <View style={styles.info}>
          <ThemedText numberOfLines={1}>{intake.productName}</ThemedText>
          <ThemedText type="small" themeColor="accent">
            {t('intake.rowTime', { time: formatTime(intake.takenAt) })}
            {quantity ? ` · ${quantity}` : ''}
          </ThemedText>
        </View>
        <AsNeededMark size={20} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    paddingVertical: Spacing.ten,
    paddingHorizontal: Spacing.twelve,
    borderRadius: Radius.button,
  },
  info: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
