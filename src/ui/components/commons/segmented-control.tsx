import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props<T extends string> = {
  options: readonly { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: Props<T>) {
  const theme = useTheme();

  return (
    <ThemedView type="surface" style={styles.track}>
      {options.map(({ value, label }) => {
        const isSelected = value === selected;
        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.segment,
              isSelected && { backgroundColor: theme.background },
            ]}
          >
            <ThemedText
              type="smallBold"
              themeColor={isSelected ? 'text' : 'textSecondary'}
            >
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: Spacing.four,
    borderRadius: Radius.button,
  },
  segment: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE - Spacing.eight,
    borderRadius: Radius.button - Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
