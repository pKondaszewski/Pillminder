import * as Battery from 'expo-battery';
import Constants from 'expo-constants';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';

export function isBatteryOptimizationEnabled(): Promise<boolean> {
  return Battery.isBatteryOptimizationEnabledAsync();
}

export async function openBatteryOptimizationSettings(): Promise<void> {
  await startActivityAsync(
    ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
    {
      data: `package:${Constants.expoConfig?.android?.package}`,
    },
  );
}
