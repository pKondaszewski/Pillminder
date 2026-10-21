import { createLogger } from '@/config/logger';

import type { IntakeEdit } from './dto/intake-output';
import {
  deleteIntakeRow,
  insertIntakeRow,
  intakesBetweenQuery,
  productIntakesQuery,
  updateIntakeRow,
} from './intake-repository';
import { isValidIntakeQuantity } from './intake-stock';

export type { Intake, IntakeEdit } from './dto/intake-output';
export { intakeDayKeys, recentIntakeCount } from './intake-history';
export { latestUseAt } from './intake-repository';

const log = createLogger('intake-service');

export function getIntakesBetweenQuery(from: Date, to: Date) {
  return intakesBetweenQuery(from, to);
}

export function getProductIntakesQuery(productId: string) {
  return productIntakesQuery(productId);
}

export function takeNow(productId: string, now: Date): string {
  log.info(`Recording as-needed intake of product ${productId}`);
  try {
    return insertIntakeRow(productId, now, 1);
  } catch (err) {
    log.error(`Failed to record intake of product ${productId}`, err);
    throw err;
  }
}

export function editIntake(id: string, edit: IntakeEdit): void {
  if (!isValidIntakeQuantity(edit.quantity)) {
    throw new Error(`Invalid intake quantity ${edit.quantity}`);
  }
  log.info(`Editing intake ${id}`);
  try {
    updateIntakeRow(id, edit);
  } catch (err) {
    log.error(`Failed to edit intake ${id}`, err);
    throw err;
  }
}

export function removeIntake(id: string): void {
  log.info(`Removing intake ${id}`);
  try {
    deleteIntakeRow(id);
  } catch (err) {
    log.error(`Failed to remove intake ${id}`, err);
    throw err;
  }
}
