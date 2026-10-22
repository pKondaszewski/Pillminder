import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/commons/ui/themed-text';

export function TutorialSkipButton({ onSkip }: { onSkip: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onSkip}
      accessibilityRole="button"
      style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
    >
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('tutorial.skip')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  skip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
