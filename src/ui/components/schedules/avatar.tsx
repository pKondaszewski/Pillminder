import type { ComponentProps } from 'react';

import { imageFileUri } from '@/images/image-files';
import { ProductAvatar } from '@/ui/components/commons/product-avatar';

type Props = {
  category: string;
  profileImageFileName: string | null;
  size: ComponentProps<typeof ProductAvatar>['size'];
  dimmed?: boolean;
};

export function ScheduleProductAvatar({
  category,
  profileImageFileName,
  size,
  dimmed,
}: Props) {
  return (
    <ProductAvatar
      category={category}
      size={size}
      imageUri={
        profileImageFileName ? imageFileUri(profileImageFileName) : null
      }
      dimmed={dimmed}
    />
  );
}
