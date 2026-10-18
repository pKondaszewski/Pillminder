import type { TFunction } from 'i18next';
import { Alert } from 'react-native';

import type { ImageSource } from '@/images/image-service';

export function chooseImageSource(
  t: TFunction,
  onChoose: (source: ImageSource) => void,
) {
  Alert.alert(t('images.add'), undefined, [
    { text: t('images.camera'), onPress: () => onChoose('camera') },
    { text: t('images.gallery'), onPress: () => onChoose('gallery') },
    { text: t('editor.cancel'), style: 'cancel' },
  ]);
}
