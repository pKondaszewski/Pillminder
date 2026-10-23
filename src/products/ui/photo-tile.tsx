import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

const BADGE_SIZE = 28;
const BADGE_HIT_SLOP = (MIN_TOUCH_SIZE - BADGE_SIZE) / 2;

type Props = {
  uri: string;
  profile: boolean;
  onPress: () => void;
  onSetProfile: () => void;
  onDelete: () => void;
};

export function PhotoTile({
  uri,
  profile,
  onPress,
  onSetProfile,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThemedView style={styles.tile}>
      <Pressable
        onPress={onPress}
        accessibilityRole="imagebutton"
        accessibilityLabel={t('images.preview')}
        style={styles.fill}
      >
        <Image source={{ uri }} style={styles.fill} contentFit="cover" />
      </Pressable>
      <Pressable
        onPress={onDelete}
        hitSlop={BADGE_HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={t('images.delete')}
        style={[
          styles.badge,
          styles.topLeft,
          { backgroundColor: theme.background },
        ]}
      >
        <Icon name="remove" size={18} color={theme.danger} />
      </Pressable>
      <Pressable
        onPress={onSetProfile}
        hitSlop={BADGE_HIT_SLOP}
        accessibilityRole="button"
        accessibilityState={{ selected: profile }}
        accessibilityLabel={
          profile ? t('images.profile') : t('images.setProfile')
        }
        style={[
          styles.badge,
          styles.topRight,
          { backgroundColor: profile ? theme.accent : theme.background },
        ]}
      >
        <Icon
          name={profile ? 'star' : 'star_border'}
          size={18}
          color={profile ? theme.onAccent : theme.textSecondary}
        />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: Spacing.eight,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeft: {
    left: Spacing.eight,
  },
  topRight: {
    right: Spacing.eight,
  },
});
