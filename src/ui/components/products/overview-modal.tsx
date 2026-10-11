import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ProductOverviewEntry } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ActionButton } from '@/ui/components/commons/action-button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useProductOverview } from '@/ui/hooks/use-product-overview';

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
          <ThemedView style={styles.actions}>
            <ActionButton
              label={t('editor.close')}
              onPress={onClose}
              themeColor="accent"
            />
          </ThemedView>
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
      <ThemedText
        type={product.stock.isLow ? 'smallBold' : 'small'}
        themeColor={product.stock.isLow ? 'warning' : undefined}
      >
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
  actions: {
    flexDirection: 'row',
  },
});
