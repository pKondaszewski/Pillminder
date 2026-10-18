import { useTranslation } from 'react-i18next';

import type { BackupRows } from '@/backup/backup-service';
import { ConfirmDialog } from '@/ui/components/commons/confirm-dialog';
import type { Confirmation } from '@/ui/hooks/use-confirmation';

export function BackupImportDialog({
  confirmation,
}: {
  confirmation: Confirmation<BackupRows>;
}) {
  const { t } = useTranslation();
  const rows = confirmation.pending?.value;

  return (
    <ConfirmDialog
      visible={confirmation.pending !== null}
      destructive
      title={t('backup.confirmTitle')}
      message={t('backup.confirmMessage', {
        products: rows?.products.length ?? 0,
        schedules: rows?.schedules.length ?? 0,
        doses: rows?.doses.length ?? 0,
        notes: rows?.notes.length ?? 0,
      })}
      confirmLabel={t('backup.confirmAction')}
      onConfirm={confirmation.confirm}
      onCancel={confirmation.cancel}
    />
  );
}
