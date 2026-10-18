import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { storeSuggestionKeys } from '@/products/category';
import { Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  category: string;
  onPick: (storeLink: string) => void;
};

export function StoreSuggestions({ category, onPick }: Props) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.chips}>
      {storeSuggestionKeys(category).map((key) => (
        <Chip
          key={key}
          label={t(`storeSuggestion.${key}`)}
          selected={false}
          onPress={() => onPick(t(`storeSuggestion.${key}`))}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
