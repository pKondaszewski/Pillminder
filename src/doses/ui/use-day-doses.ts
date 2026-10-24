import { addDays } from '@/config/date-utils';
import {
  correctDoseState,
  restoreDose,
  revertDose,
  skipDose,
  takeDose,
} from '@/doses/dose-service';

import { useDosesBetween } from './use-doses-between';

export function useDayDoses(day: Date) {
  const doses = useDosesBetween(day, addDays(day, 1));

  return {
    doses,
    takeDose,
    skipDose,
    revertDose,
    correctDoseState,
    restoreDose,
  };
}
