import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  isValidSnoozeMinutes,
  SNOOZE_MINUTES_MAX,
  SNOOZE_MINUTES_MIN,
} from '@/settings/settings-store';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { TextField } from '@/ui/components/commons/text-field';

type Props = {
  minutes: number;
  onSave: (minutes: number) => void;
  onClose: () => void;
};

export function SnoozeSheet({ minutes, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState(String(minutes));
  const [submitted, setSubmitted] = useState(false);
  const parsed = Number(text);
  const valid = text !== '' && isValidSnoozeMinutes(parsed);

  const save = () => {
    if (valid) onSave(parsed);
    else setSubmitted(true);
  };

  return (
    <BottomSheet
      visible
      title={t('settings.snooze')}
      onClose={onClose}
      onSave={save}
    >
      <TextField
        value={text}
        onChangeText={(value) => setText(value.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={String(SNOOZE_MINUTES_MAX).length}
        accessibilityLabel={t('settings.snooze')}
        error={
          submitted && !valid
            ? t('settings.snoozeInvalid', {
                min: SNOOZE_MINUTES_MIN,
                max: SNOOZE_MINUTES_MAX,
              })
            : undefined
        }
      />
    </BottomSheet>
  );
}
