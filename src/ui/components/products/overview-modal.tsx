import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ProductOverviewEntry } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useProductOverview } from '@/ui/hooks/use-product-overview';

const LOW_STOCK_COLOR = '#d97706';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ProductOverviewModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? <SummaryContent onClose={onClose} /> : null}
    </Modal>
  );
}

function SummaryContent({ onClose }: Pick<Props, 'onClose'>) {
  const { t } = useTranslation();
  const { products } = useProductOverview();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('overview.title')}</ThemedText>
          {products.length === 0 ? (
            <ThemedView style={styles.empty}>
              <ThemedText>{t('overview.empty')}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('overview.emptyHint')}
              </ThemedText>
            </ThemedView>
          ) : (
            products.map((product) => (
              <ProductBlock key={product.id} product={product} />
            ))
          )}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="backgroundElement" style={styles.closeButton}>
              <ThemedText themeColor="accent" style={styles.closeText}>
                {t('editor.close')}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ProductBlock({ product }: { product: ProductOverviewEntry }) {
  return (
    <ThemedView type="backgroundElement" style={styles.block}>
      <ThemedText type="smallBold">{product.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {product.category}
      </ThemedText>
      {product.rhythm.map((line, index) => (
        <ThemedText key={index} type="small">
          {line}
        </ThemedText>
      ))}
      <ThemedText type="small" style={product.stock.isLow && styles.lowStock}>
        {product.stock.text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  content: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  empty: {
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  block: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  lowStock: {
    color: LOW_STOCK_COLOR,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  closeText: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
