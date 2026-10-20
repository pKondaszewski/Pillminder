import { useEffect, useState } from 'react';

import type { TimelineMark, TodayDose } from '@/doses/dose-service';
import { MeadowPopup } from '@/doses/ui/meadow-popup';
import type { MeadowMark } from '@/scene/scene-service';
import { MeadowOverlay } from '@/scene/ui/meadow-overlay';

const POPUP_VISIBLE_MS = 6000;

type Props = {
  timeline: TimelineMark[];
  marks: MeadowMark[];
  canTake: boolean;
  topInset: number;
  onTake: (dose: TodayDose) => void;
};

export function TodayMeadow({
  timeline,
  marks,
  canTake,
  topInset,
  onTake,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const index = marks.findIndex(({ id }) => id === selectedId);
  const selected = index < 0 ? null : timeline[index];

  useEffect(() => {
    if (selectedId === null) return;
    const timer = setTimeout(() => setSelectedId(null), POPUP_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [selectedId]);

  const toggle = (markId: string) =>
    setSelectedId((current) => (current === markId ? null : markId));
  const take = (dose: TodayDose) => {
    const stillPending = selected?.doses.filter(
      ({ id, state }) => id !== dose.id && state === 'pending',
    );
    if (!stillPending?.length) setSelectedId(null);
    onTake(dose);
  };

  return (
    <MeadowOverlay
      marks={marks}
      topInset={topInset}
      selectedId={selectedId}
      onSelect={toggle}
    >
      {selected ? (
        <MeadowPopup
          mark={selected}
          index={index}
          canTake={canTake}
          onTake={take}
        />
      ) : null}
    </MeadowOverlay>
  );
}
