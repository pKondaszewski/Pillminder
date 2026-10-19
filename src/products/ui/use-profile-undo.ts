import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import { setProfileImage } from '@/images/image-service';

export function useProfileUndo(
  productId: string,
  profileImageId: string | null,
  runWithUndo: RunWithUndo,
) {
  const { t } = useTranslation();

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

  return { setProfileWithUndo };
}
