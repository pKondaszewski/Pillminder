import { useEffect } from 'react';

import {
  deleteImageRowsWithoutFile,
  deleteOrphanedImageFiles,
} from '@/images/image-service';

export function useOrphanedImageCleanup() {
  useEffect(() => {
    void deleteOrphanedImageFiles();
    void deleteImageRowsWithoutFile();
  }, []);
}
