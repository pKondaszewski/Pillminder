import type { MaterialTopTabBarProps } from 'expo-router/js-top-tabs';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

type TabRoute = { key: string; name: string; params?: object };

const MIN_TOUCH_TARGET = 48;

const TAB_ICONS = {
  '(today)': 'home',
  '(products)': 'medication',
  '(plan)': 'event',
  '(settings)': 'settings',
} as const;

export function AppTabBar({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.bar, { paddingBottom: bottom }]}>
      {(state.routes as TabRoute[]).map((route, index) => {
        const focused = state.index === index;
        const color = focused ? theme.text : theme.textSecondary;
        const select = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={select}
            style={styles.tab}
          >
            <ThemedView
              style={styles.indicator}
              type={focused ? 'surface' : undefined}
            >
              <Icon
                name={TAB_ICONS[route.name as keyof typeof TAB_ICONS]}
                color={color}
              />
            </ThemedView>
            <ThemedText type="caption" style={{ color }}>
              {descriptors[route.key].options.title}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: Spacing.twelve,
  },
  tab: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    gap: Spacing.four,
  },
  indicator: {
    width: 64,
    height: 32,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
