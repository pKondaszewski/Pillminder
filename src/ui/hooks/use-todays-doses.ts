import { addDays } from '@/config/date-utils';
import {
  skipDose,
  takeDose,
  unskipDose,
  untakeDose,
} from '@/doses/dose-service';

import { useCurrentDay } from './use-current-day';
import { useDosesBetween } from './use-doses-between';

export function useTodaysDoses() {
  const day = new Date(useCurrentDay());
  const doses = useDosesBetween(day, addDays(day, 1));

  return { doses, takeDose, untakeDose, skipDose, unskipDose };
}
