import { useTranslation } from 'react-i18next';

import { useFormatTime } from '@/commons/ui/use-format-date';
import { nowPosition } from '@/doses/dose-service';
import type { Intake } from '@/intakes/intake-service';
import type { IntakeMarker } from '@/scene/scene-service';

export function useIntakeMarkers(intakes: Intake[]): IntakeMarker[] {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();

  return intakes.map(({ id, takenAt, productName }) => ({
    id,
    position: nowPosition(takenAt),
    label: `${productName}, ${t('intake.rowTime', { time: formatTime(takenAt) })}`,
  }));
}
