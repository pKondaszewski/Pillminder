import { useEffect } from 'react';

import { refreshLocation } from '@/location/location-service';

export function useLocationRefresh(): void {
  useEffect(() => {
    void refreshLocation(Date.now());
  }, []);
}
