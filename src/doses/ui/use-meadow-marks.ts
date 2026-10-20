import { useTranslation } from 'react-i18next';

import { useFormatTime } from '@/commons/ui/use-format-date';
import type { TimelineMark } from '@/doses/dose-service';
import type { MeadowMark } from '@/scene/scene-service';

export function useMeadowMarks(timeline: TimelineMark[]): MeadowMark[] {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();

  return timeline.map(({ id, position, status, doses }) => ({
    id,
    position,
    status,
    size: doses.length,
    taken: doses.filter(({ state }) => state === 'taken').length,
    label: doses
      .map(({ productName, plannedAt }) =>
        t('home.card.nextDose', {
          name: productName,
          time: formatTime(plannedAt),
        }),
      )
      .join(', '),
  }));
}
