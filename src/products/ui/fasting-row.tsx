import { useTranslation } from 'react-i18next';

import { SwitchRow } from '@/commons/ui/switch-row';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function FastingRow({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <SwitchRow
      label={t('editor.fasting')}
      value={value}
      onValueChange={onChange}
    />
  );
}
