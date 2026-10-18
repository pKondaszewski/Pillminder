import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  title: string;
  hint?: string;
  trailing?: ReactNode;
  children: ReactNode;
};

export function ProductSection({ title, hint, trailing, children }: Props) {
  return (
    <ThemedView style={styles.section}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titles}>
          <ThemedText type="label">{title}</ThemedText>
          {hint ? <ThemedText type="caption">{hint}</ThemedText> : null}
        </ThemedView>
        {trailing}
      </ThemedView>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.twelve,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.twelve,
  },
  titles: {
    flexShrink: 1,
    gap: Spacing.four,
  },
});
