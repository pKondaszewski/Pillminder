import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import { deletionChange } from '@/config/undoable-change';
import {
  getIntakesBetweenQuery,
  getProductIntakesQuery,
  type Intake,
  newIntakeId,
  removeIntake,
  restoreIntake,
  takeNow,
} from '@/intakes/intake-service';
import type { Product } from '@/products/product-service';
import { useProducts } from '@/products/ui/use-products';

export function useIntakesBetween(from: Date, to: Date): Intake[] {
  const { products } = useProducts();
  // useLiveQuery re-runs only on changes of the FROM table (intakes), so
  // product edits are signalled through the live products list as a dep.
  const { data } = useLiveQuery(getIntakesBetweenQuery(from, to), [
    from.getTime(),
    to.getTime(),
    products,
  ]);
  return data;
}

export function useProductIntakes(productId: string): Intake[] {
  const { products } = useProducts();
  const { data } = useLiveQuery(getProductIntakesQuery(productId), [
    productId,
    products,
  ]);
  return data;
}

export function useTakeNow({ id, name }: Product, runWithUndo: RunWithUndo) {
  const { t } = useTranslation();

  return () => {
    const intakeId = newIntakeId();
    void runWithUndo(
      {
        message: t('intake.takenToast', { name }),
        apply: () => takeNow(intakeId, id, new Date()),
        revert: () => {
          removeIntake(intakeId);
        },
      },
      'intake.errorSave',
    );
  };
}

export function useRemoveIntake(runWithUndo: RunWithUndo) {
  const { t } = useTranslation();

  return ({ id, productName }: Intake) =>
    runWithUndo(
      deletionChange(
        t('intake.removedToast', { name: productName }),
        () => removeIntake(id),
        restoreIntake,
      ),
      'intake.errorSave',
    );
}
