import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { doseQuantityText } from '@/doses/dose-service';
import { type DayMode } from '@/doses/ui/dose-row-action';
import type { Intake } from '@/intakes/intake-service';
import { AsNeededMark } from '@/intakes/ui/as-needed-mark';

type Props = {
  intake: Intake;
  mode: DayMode;
  onRevert: (intake: Intake) => void;
  onOpenProduct: (intake: Intake) => void;
};

export function IntakeRow({ intake, mode, onRevert, onOpenProduct }: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const quantity = doseQuantityText(intake.quantity, intake.unit, t);
  const reverts = mode === 'today';
  const openProduct = () => onOpenProduct(intake);

  return (
    <Pressable
      onPress={reverts ? () => onRevert(intake) : openProduct}
      onLongPress={openProduct}
      accessibilityHint={t(
        reverts ? 'home.rowHint.revert' : 'home.rowHint.open',
      )}
      accessibilityActions={[
        { name: 'longpress', label: t('home.rowHint.open') },
      ]}
      onAccessibilityAction={openProduct}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView type="accentSoft" style={styles.row}>
        <ThemedText type="mono" themeColor="textSecondary" style={styles.time}>
          {formatTime(intake.takenAt)}
        </ThemedText>
        <ProductAvatar
          category={intake.category}
          size={36}
          imageFileName={intake.profileImageFileName}
        />
        <View style={styles.info}>
          <ThemedText numberOfLines={1}>{intake.productName}</ThemedText>
          <View style={styles.caption}>
            <AsNeededMark />
            <ThemedText type="small" themeColor="accent">
              {t('intake.label')}
              {quantity ? ` · ${quantity}` : ''}
            </ThemedText>
          </View>
        </View>
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
  time: {
    width: 48,
  },
  info: {
    flex: 1,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
