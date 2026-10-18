import { StyleSheet } from 'react-native';

import { isStockBarLow, stockBarFill } from '@/products/stock-bar';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  daysLeft: number;
  label: string;
};

export function StockBar({ daysLeft, label }: Props) {
  const theme = useTheme();
  const fillColor = isStockBarLow(daysLeft) ? theme.overdue : theme.accent;

  return (
    <ThemedView style={styles.container}>
      <ThemedView type="divider" style={styles.track}>
        <ThemedView
          style={{
            width: `${stockBarFill(daysLeft) * 100}%`,
            height: '100%',
            backgroundColor: fillColor,
          }}
        />
      </ThemedView>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
});
