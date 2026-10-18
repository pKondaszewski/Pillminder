import { G, Path } from 'react-native-svg';

import type { DaySymbol } from '@/doses/dose-service';
import { useTheme } from '@/ui/hooks/use-theme';

const SUN_RAYS =
  'M0 -15v3M0 12v3M-15 0h3M12 0h3M-10.6 -10.6l2.1 2.1M8.5 8.5l2.1 2.1M-10.6 10.6l2.1 -2.1M8.5 -8.5l2.1 -2.1';
const RISING_SUN_RAYS =
  'M0 -15v3M-15 -3h3M12 -3h3M-10.6 -10.6l2.1 2.1M8.5 -8.5l2.1 -2.1';
const SUN_DISC = 'M-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0';
const RISING_SUN_DISC = 'M-8 3a8 8 0 0 1 16 0Z';
const HORIZON_DASH = 'M-12 3H12';
const MOON = 'M3 -10A11 11 0 1 0 10 3A8.5 8.5 0 0 1 3 -10Z';
const RAY_WIDTH = 2;

type Props = {
  symbol: DaySymbol;
  x: number;
  y: number;
};

export function DaySymbolMark({ symbol, x, y }: Props) {
  const theme = useTheme();

  return (
    <G transform={`translate(${x} ${y})`}>
      {symbol === 'moon' ? <Path d={MOON} fill={theme.textSecondary} /> : null}
      {symbol === 'sun' ? (
        <>
          <Path d={SUN_DISC} fill={theme.sun} />
          <Path
            d={SUN_RAYS}
            stroke={theme.sun}
            strokeWidth={RAY_WIDTH}
            strokeLinecap="round"
          />
        </>
      ) : null}
      {symbol === 'risingSun' ? (
        <>
          <Path d={RISING_SUN_DISC} fill={theme.sun} />
          <Path
            d={`${RISING_SUN_RAYS}${HORIZON_DASH}`}
            stroke={theme.sun}
            strokeWidth={RAY_WIDTH}
            strokeLinecap="round"
          />
        </>
      ) : null}
    </G>
  );
}
