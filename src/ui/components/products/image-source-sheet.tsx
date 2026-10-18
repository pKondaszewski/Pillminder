import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import type { ImageSource } from '@/images/image-service';
import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

// Android has no Modal.onDismiss, so the picker waits out the slide-out animation
const SHEET_CLOSE_DELAY_MS = 300;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (source: ImageSource) => void;
};

const OPTIONS = [
  { source: 'camera', icon: 'photo_camera', labelKey: 'images.camera' },
  { source: 'gallery', icon: 'photo_library', labelKey: 'images.gallery' },
] as const;

export function ImageSourceSheet({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const choose = (source: ImageSource) => {
    onClose();
    setTimeout(() => onSelect(source), SHEET_CLOSE_DELAY_MS);
  };

  return (
    <BottomSheet visible={visible} title={t('images.add')} onClose={onClose}>
      {OPTIONS.map(({ source, icon, labelKey }) => (
        <Pressable
          key={source}
          onPress={() => choose(source)}
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
