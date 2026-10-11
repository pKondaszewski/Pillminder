import { StyleSheet, TextInput } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
};

export function SearchField({ value, onChangeText, label }: Props) {
  const theme = useTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      accessibilityLabel={label}
      placeholder={label}
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.search,
        { color: theme.text, borderColor: theme.backgroundSelected },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
