import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { useTheme } from '@/commons/ui/use-theme';

type Props = {
  onPress: () => void;
};

export function TakeNowButton({ onPress }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('intake.takeNow')}, ${t('intake.label')}`}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.accentSoft, borderColor: theme.accent },
        pressed && styles.pressed,
      ]}
    >
      <Icon name="bolt" size={20} color={theme.accent} />
      <ThemedText type="smallBold" themeColor="accent">
        {t('intake.takeNow')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.eight,
    borderWidth: 1,
    borderRadius: Radius.button,
  },
  pressed: {
    opacity: 0.7,
  },
});
