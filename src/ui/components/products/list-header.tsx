import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { ScreenTitle } from '@/ui/components/commons/screen-title';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

export function ProductListHeader({
  onTravelPress,
}: {
  onTravelPress: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScreenTitle
      title={t('products.title')}
      action={
        <Pressable
          onPress={onTravelPress}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.travel,
            { borderColor: theme.borderStrong },
            pressed && styles.pressed,
          ]}
        >
          <Icon name="luggage" size={20} color={theme.accent} />
          <ThemedText type="smallBold">{t('products.travel')}</ThemedText>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  travel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: Spacing.fourteen,
    borderWidth: 1,
    borderRadius: Radius.button,
  },
  pressed: {
    opacity: 0.7,
  },
});
