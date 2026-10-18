import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { setProfileImage } from '@/images/image-service';

interface Undoable {
  key: string;
  previousImageId: string | null;
}

export function useProfileUndo(
  productId: string,
  profileImageId: string | null,
) {
  const { t } = useTranslation();
  const [undoable, setUndoable] = useState<Undoable | null>(null);

  const reportFailure = () =>
    Alert.alert(t('products.errorTitle'), t('images.errorProfile'));

  const setProfileWithUndo = async (imageId: string) => {
    if (imageId === profileImageId) return;
    try {
      await setProfileImage(productId, imageId);
    } catch {
      reportFailure();
      return;
    }
    setUndoable({ key: imageId, previousImageId: profileImageId });
  };

  const undoProfile = async () => {
    if (!undoable) return;
    setUndoable(null);
    try {
      await setProfileImage(productId, undoable.previousImageId);
    } catch {
      reportFailure();
    }
  };

  const dismissUndo = () => setUndoable(null);

  return { undoable, setProfileWithUndo, undoProfile, dismissUndo };
}
