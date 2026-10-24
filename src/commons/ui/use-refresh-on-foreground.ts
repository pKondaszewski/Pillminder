import { useEffect } from 'react';
import { AppState } from 'react-native';

export function useRefreshOnForeground(refresh: () => void): void {
  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);
}
