import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Spacing } from '@/ui/commons/constants/theme';
import { Switch } from '@/ui/components/commons/switch';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function FastingRow({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.row}>
      <ThemedText>{t('editor.fasting')}</ThemedText>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={t('editor.fasting')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sixteen,
    minHeight: MIN_TOUCH_SIZE,
  },
});
