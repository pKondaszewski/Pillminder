import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Icon } from '@/commons/ui/icon';
import { useTheme } from '@/commons/ui/use-theme';

type Props = {
  size?: number;
};

export function AsNeededMark({ size = 16 }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View accessible accessibilityLabel={t('intake.label')}>
      <Icon name="bolt" size={size} color={theme.accent} />
    </View>
  );
}
