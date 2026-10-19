import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { wholeDaysLeft } from '@/products/product-text';

type Props = {
  productName: string;
  daysLeft: number;
  onPress: () => void;
  onOrder: () => void;
};

export function LowStockBanner({
  productName,
  daysLeft,
  onPress,
  onOrder,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThemedView
      type="overdueCard"
      style={[styles.banner, { borderColor: theme.overdueCardBorder }]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={styles.message}
      >
        <ThemedText type="smallBold" themeColor="overdueText">
          {t('products.lowStockBanner', {
            name: productName,
            days: t('products.daysCount', { count: wholeDaysLeft(daysLeft) }),
          })}
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={onOrder}
        accessibilityRole="button"
        style={styles.order}
      >
        <ThemedText type="smallBold" themeColor="accent">
          {t('products.lowStockOrder')}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  message: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingVertical: Spacing.eight,
  },
  order: {
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: Spacing.sixteen,
    justifyContent: 'center',
  },
});
