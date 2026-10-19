import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { categoryLabel } from '@/products/category';
import { categoryAvatar } from '@/products/category-avatar';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';

type Props = {
  product: Product;
  photoCount: number;
  lastUsed: string;
  onPhotosPress: () => void;
  onNamePress: () => void;
  onCategoryPress: () => void;
};

export function ProductHeader({
  product,
  photoCount,
  lastUsed,
  onPhotosPress,
  onNamePress,
  onCategoryPress,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const archived = product.status === 'archived';
  const categoryColors = theme.category[categoryAvatar(product.category).tone];

  return (
    <ThemedView style={styles.header}>
      <Pressable
        onPress={onPhotosPress}
        accessibilityRole="button"
        accessibilityLabel={t('products.detail.photos', { count: photoCount })}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ProductAvatar
          category={product.category}
          size={88}
          imageFileName={product.profileImageFileName}
        />
        {photoCount > 0 ? (
          <ThemedView type="accent" style={styles.badge}>
            <ThemedText type="caption" themeColor="onAccent">
              {photoCount}
            </ThemedText>
          </ThemedView>
        ) : null}
      </Pressable>
      <ThemedView style={styles.texts}>
        <Pressable
          onPress={onNamePress}
          accessibilityRole="button"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="subtitle">
            {productLabel(product.name, product.strength)}
          </ThemedText>
        </Pressable>
        <ThemedView style={styles.tags}>
          <Pressable
            onPress={onCategoryPress}
            accessibilityRole="button"
            style={[styles.tag, { backgroundColor: categoryColors.tile }]}
          >
            <ThemedText type="smallBold" style={{ color: categoryColors.icon }}>
              {categoryLabel(product.category, t)}
            </ThemedText>
          </Pressable>
          <ThemedView
            type={archived ? 'surface' : 'takenSoft'}
            style={styles.tag}
          >
            <ThemedText
              type="smallBold"
              themeColor={archived ? 'textSecondary' : 'takenText'}
            >
              {archived ? t('products.archived') : t('products.active')}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedText type="small" themeColor="textSecondary">
          {lastUsed}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sixteen,
  },
  texts: {
    flex: 1,
    gap: Spacing.eight,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
  tag: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.ten,
    borderRadius: Radius.pill,
  },
  badge: {
    position: 'absolute',
    right: -Spacing.four,
    bottom: -Spacing.four,
    minWidth: 22,
    height: 22,
    paddingHorizontal: Spacing.four,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
