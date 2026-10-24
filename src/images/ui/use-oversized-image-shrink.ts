import { useEffect } from 'react';

import { shrinkOversizedImages } from '@/images/image-service';

export function useOversizedImageShrink() {
  useEffect(() => {
    void shrinkOversizedImages();
  }, []);
}
