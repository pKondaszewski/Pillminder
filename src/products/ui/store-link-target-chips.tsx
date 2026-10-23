import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import {
  STORE_LINK_TARGETS,
  type StoreLinkTarget,
} from '@/products/product-service';

type Props = {
  selected: StoreLinkTarget | null;
  onSelect: (target: StoreLinkTarget | null) => void;
};

const OPTIONS = [null, ...STORE_LINK_TARGETS] as const;

export function StoreLinkTargetChips({ selected, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <ThemedText type="caption">{t('storeTarget.openWith')}</ThemedText>
      <ThemedView style={styles.chips}>
        {OPTIONS.map((target) => (
          <Chip
            key={target ?? 'ask'}
            label={t(`storeTarget.${target ?? 'ask'}`)}
            selected={target === selected}
            onPress={() => onSelect(target)}
          />
        ))}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
