import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { SwitchRow } from '@/commons/ui/switch-row';
import { ThemedText } from '@/commons/ui/themed-text';
import { useTheme } from '@/commons/ui/use-theme';
import type { StoreLinkTarget } from '@/products/product-service';

type Props = {
  onChoose: (target: StoreLinkTarget, remember: boolean) => void;
  onClose: () => void;
};

const OPTIONS = [
  { target: 'maps', icon: 'map', labelKey: 'storeTarget.maps' },
  { target: 'web', icon: 'language', labelKey: 'storeTarget.web' },
] as const;

export function StoreTargetSheet({ onChoose, onClose }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [remember, setRemember] = useState(false);

  return (
    <BottomSheet visible title={t('storeTarget.title')} onClose={onClose}>
      {OPTIONS.map(({ target, icon, labelKey }) => (
        <Pressable
          key={target}
          onPress={() => onChoose(target, remember)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.option,
            { borderColor: theme.borderStrong },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={icon} size={24} color={theme.accent} />
          <ThemedText type="smallBold">{t(labelKey)}</ThemedText>
        </Pressable>
      ))}
      <SwitchRow
        label={t('storeTarget.remember')}
        value={remember}
        onValueChange={setRemember}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.twelve,
    borderWidth: 1,
    borderRadius: Radius.button,
  },
  pressed: {
    opacity: 0.6,
  },
});
