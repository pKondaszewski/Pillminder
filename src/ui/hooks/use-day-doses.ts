import { addDays } from '@/config/date-utils';
import {
  correctDoseState,
  skipDose,
  takeDose,
  unskipDose,
  untakeDose,
} from '@/doses/dose-service';

import { useDosesBetween } from './use-doses-between';

export function useDayDoses(day: Date) {
  const doses = useDosesBetween(day, addDays(day, 1));

  return {
    doses,
    takeDose,
    untakeDose,
    skipDose,
    unskipDose,
    correctDoseState,
  };
}
