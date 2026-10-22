import { StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Spacing } from './constants/theme';
import { Switch } from './switch';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SwitchRow({ label, value, onValueChange, disabled }: Props) {
  return (
    <ThemedView style={styles.row}>
      <ThemedText>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        disabled={disabled}
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
