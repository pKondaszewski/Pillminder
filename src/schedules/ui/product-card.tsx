import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { categoryLabel } from '@/products/category';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';

type Props = {
  product: Product;
  onPress: () => void;
};

export function ScheduleProductCard({ product, onPress }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView type="surface" style={styles.card}>
        <ProductAvatar
          category={product.category}
          imageFileName={product.profileImageFileName}
          size={40}
        />
        <View style={styles.text}>
          <ThemedText type="headline" numberOfLines={1}>
            {productLabel(product.name, product.strength)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {categoryLabel(product.category, t)}
          </ThemedText>
        </View>
        <Icon name="chevron_right" size={20} color={theme.textTertiary} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    padding: Spacing.sixteen,
    borderRadius: Radius.card,
  },
  text: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
