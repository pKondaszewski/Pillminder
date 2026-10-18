import { useTranslation } from 'react-i18next';

import { setProfileImage } from '@/images/image-service';

import { useUndoSnackbar } from './use-undo-snackbar';

export function useProfileUndo(
  productId: string,
  profileImageId: string | null,
) {
  const { t } = useTranslation();
  const { snackbar, runWithUndo } = useUndoSnackbar();

  const setProfileWithUndo = async (imageId: string) => {
    if (imageId === profileImageId) return;
    await runWithUndo(
      {
        message: t('images.profileChanged'),
        apply: () => setProfileImage(productId, imageId),
        revert: () => setProfileImage(productId, profileImageId),
      },
      'images.errorProfile',
    );
  };

  return { snackbar, setProfileWithUndo };
}
