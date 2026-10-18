import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { FontFamily } from '@/ui/commons/constants/fonts';
import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  error?: string;
};

export function TextField({ error, ...inputProps }: Props) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <TextInput
        placeholderTextColor={theme.textTertiary}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.borderStrong,
          },
        ]}
        {...inputProps}
      />
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  input: {
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.button,
    fontFamily: FontFamily.regular,
    fontSize: 15,
  },
});
