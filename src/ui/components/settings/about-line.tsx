import { StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { AppLogo } from '@/ui/components/commons/app-logo';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  appName: string;
  version: string;
  author: string;
};

export function AboutLine({ appName, version, author }: Props) {
  return (
    <ThemedView style={styles.row}>
      <AppLogo size={40} />
      <ThemedView>
        <ThemedText type="smallBold">{`${appName} ${version}`}</ThemedText>
        <ThemedText type="caption">{author}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
  },
});
