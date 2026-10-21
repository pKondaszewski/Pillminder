import { useState } from 'react';

import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import {
  editIntake,
  type Intake,
  removeIntake,
} from '@/intakes/intake-service';
import { IntakeEditSheet } from '@/intakes/ui/intake-edit-sheet';

export function useIntakeEditor() {
  const [editing, setEditing] = useState<Intake | null>(null);

  const runWithAlert = useRunWithErrorAlert();

  const run = (change: () => void) => {
    setEditing(null);
    return runWithAlert(async () => change(), 'intake.errorSave');
  };

  const sheet = editing ? (
    <IntakeEditSheet
      key={editing.id}
      intake={editing}
      onSave={(id, edit) => run(() => editIntake(id, edit))}
      onDelete={(id) => run(() => removeIntake(id))}
      onClose={() => setEditing(null)}
    />
  ) : null;

  return { edit: setEditing, sheet };
}
