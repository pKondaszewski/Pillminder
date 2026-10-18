import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  title: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: Props) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="label">{title}</ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.twelve,
  },
});
