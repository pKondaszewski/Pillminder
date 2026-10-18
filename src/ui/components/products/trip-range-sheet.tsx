import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  firstWeekdayOf,
  monthGridDays,
  weekdayKeysFrom,
} from '@/config/calendar-grid';
import { addMonths, type DateRange } from '@/config/date-utils';
import type { SupportedLanguage } from '@/config/i18n';
import {
  isEdgeOfRange,
  isInsideRange,
  type RangeDraft,
  tapDay,
} from '@/products/trip-range';
import type { ThemeColor } from '@/ui/commons/constants/theme';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import {
  type DayCellState,
  MonthGrid,
} from '@/ui/components/commons/month-grid';
import { MonthHeader } from '@/ui/components/commons/month-header';
import { useFormatDate } from '@/ui/hooks/use-format-date';

type Props = {
  visible: boolean;
  range: DateRange;
  onClose: () => void;
  onSave: (range: DateRange) => void;
};

export function TripRangeSheet({ visible, range, onClose, onSave }: Props) {
  const { t, i18n } = useTranslation();
  const formatDate = useFormatDate();
  const [draft, setDraft] = useState<RangeDraft>(range);
  const [month, setMonth] = useState(range.from);
  const now = new Date();
  const firstWeekday = firstWeekdayOf(i18n.language as SupportedLanguage);
  const { to } = draft;

  const cellState = (day: Date): DayCellState => {
    const edge = isEdgeOfRange(draft, day);
    const inside = isInsideRange(draft, day);
    return {
      selected: edge || inside,
      fill: rangeFill(edge, inside),
      disabled: false,
      accessibilityLabel: formatDate(day),
    };
  };

  const save = () => {
    if (to === null) return;
    onSave({ from: draft.from, to });
  };

  const close = () => {
    setDraft(range);
    setMonth(range.from);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('travel.dates')}
      onClose={close}
      onSave={save}
      saveDisabled={to === null}
    >
      <MonthHeader
        month={month}
        onChangeMonth={(offset) => setMonth(addMonths(month, offset))}
      />
      <MonthGrid
        days={monthGridDays(month, firstWeekday)}
        month={month}
        weekdayKeys={weekdayKeysFrom(firstWeekday)}
        now={now}
        cellState={cellState}
        onSelectDay={(day) => setDraft(tapDay(draft, day))}
      />
    </BottomSheet>
  );
}

function rangeFill(edge: boolean, inside: boolean): ThemeColor {
  if (edge) return 'accent';
  return inside ? 'accentSoft' : 'background';
}
