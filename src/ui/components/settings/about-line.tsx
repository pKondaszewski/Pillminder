import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet } from 'react-native';

import { createLogger } from '@/config/logger';
import { MIN_TOUCH_SIZE, Spacing } from '@/ui/commons/constants/theme';
import { AppLogo } from '@/ui/components/commons/app-logo';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

const log = createLogger('about-line');

type Props = {
  appName: string;
  version: string;
  author: string;
  repositoryUrl: string;
};

export function AboutLine({ appName, version, author, repositoryUrl }: Props) {
  const { t } = useTranslation();

  const openRepository = () =>
    Linking.openURL(repositoryUrl).catch((err) =>
      log.error('Failed to open the repository', err),
    );

  return (
    <Pressable
      onPress={openRepository}
      accessibilityRole="link"
      accessibilityLabel={t('settings.aboutLink')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <AppLogo size={40} />
      <ThemedView>
        <ThemedText type="smallBold">{`${appName} ${version}`}</ThemedText>
        <ThemedText type="caption">{author}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    minHeight: MIN_TOUCH_SIZE,
  },
  pressed: {
    opacity: 0.6,
  },
});
