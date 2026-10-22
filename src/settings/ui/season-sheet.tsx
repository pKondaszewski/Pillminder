import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';
import {
  SEASON_OPTIONS,
  type SeasonPreference,
} from '@/settings/settings-service';

type Props = {
  selected: SeasonPreference;
  labelKeys: Record<SeasonPreference, string>;
  onSelect: (season: SeasonPreference) => void;
  onClose: () => void;
};

export function SeasonSheet({ selected, labelKeys, onSelect, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <BottomSheet visible title={t('settings.season')} onClose={onClose}>
      <ThemedView style={styles.options}>
        {SEASON_OPTIONS.map((season) => (
          <Chip
            key={season}
            label={t(labelKeys[season])}
            selected={season === selected}
            onPress={() => onSelect(season)}
          />
        ))}
      </ThemedView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
