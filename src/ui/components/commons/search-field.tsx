import { Pressable, StyleSheet, TextInput } from 'react-native';

import { FontFamily } from '@/ui/commons/constants/fonts';
import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

export type FilterToken = {
  label: string;
  removeLabel: string;
  onRemove: () => void;
};

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  tokens?: FilterToken[];
  onFilterPress?: () => void;
  filterLabel?: string;
};

export function SearchField({
  value,
  onChangeText,
  label,
  tokens = [],
  onFilterPress,
  filterLabel,
}: Props) {
  const theme = useTheme();

  return (
    <ThemedView
      style={[
        styles.field,
        { backgroundColor: theme.surface, borderColor: theme.borderStrong },
      ]}
    >
      {tokens.map((token) => (
        <Pressable
          key={token.label}
          onPress={token.onRemove}
          accessibilityLabel={token.removeLabel}
          hitSlop={Spacing.four}
          style={[styles.token, { backgroundColor: theme.accentSoft }]}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {token.label} ×
          </ThemedText>
        </Pressable>
      ))}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor={theme.textTertiary}
        style={[styles.input, { color: theme.text }]}
      />
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel={filterLabel}
          style={styles.filterButton}
        >
          <Icon
            name="filter_alt"
            size={22}
            color={tokens.length > 0 ? theme.accent : theme.textSecondary}
          />
          {tokens.length > 0 ? (
            <ThemedView
              type="accent"
              style={styles.filterDot}
              accessibilityElementsHidden
            />
          ) : null}
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.eight,
    minHeight: MIN_TOUCH_SIZE,
    paddingLeft: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.button,
  },
  token: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.ten,
    borderRadius: Radius.pill,
  },
  input: {
    flex: 1,
    minWidth: 96,
    minHeight: MIN_TOUCH_SIZE,
    fontFamily: FontFamily.regular,
    fontSize: 15,
  },
  filterButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: Spacing.ten,
    right: Spacing.ten,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
