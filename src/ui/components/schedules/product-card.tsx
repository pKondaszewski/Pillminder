import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { categoryLabel } from '@/products/category';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { ProductAvatar } from '@/ui/components/commons/product-avatar';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

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
