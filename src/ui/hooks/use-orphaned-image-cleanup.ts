import { useEffect } from 'react';

import { deleteOrphanedImageFiles } from '@/images/image-service';

export function useOrphanedImageCleanup() {
  useEffect(() => {
    void deleteOrphanedImageFiles();
  }, []);
}
