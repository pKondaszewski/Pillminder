import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

const MIN_LABEL_FONT_SCALE = 0.75;

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
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={MIN_LABEL_FONT_SCALE}
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
