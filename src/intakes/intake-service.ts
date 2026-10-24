import * as Crypto from 'expo-crypto';

import { createLogger } from '@/config/logger';

import {
  deleteIntakeRow,
  insertIntakeRow,
  intakesBetweenQuery,
  productIntakesQuery,
  restoreIntakeRow,
  type StoredIntake,
} from './intake-repository';

export type { Intake } from './dto/intake-output';
export { intakeDayKeys, recentIntakeCount } from './intake-history';
export { latestUseAt, type StoredIntake } from './intake-repository';

const log = createLogger('intake-service');

export function getIntakesBetweenQuery(from: Date, to: Date) {
  return intakesBetweenQuery(from, to);
}

export function getProductIntakesQuery(productId: string) {
  return productIntakesQuery(productId);
}

export function newIntakeId(): string {
  return Crypto.randomUUID();
}

export function takeNow(id: string, productId: string, now: Date): void {
  log.info(`Recording as-needed intake ${id} of product ${productId}`);
  try {
    insertIntakeRow(id, productId, now, 1);
  } catch (err) {
    log.error(`Failed to record intake of product ${productId}`, err);
    throw err;
  }
}

export function removeIntake(id: string): StoredIntake | undefined {
  log.info(`Removing intake ${id}`);
  try {
    return deleteIntakeRow(id);
  } catch (err) {
    log.error(`Failed to remove intake ${id}`, err);
    throw err;
  }
}

export function restoreIntake(intake: StoredIntake): void {
  log.info(`Restoring intake ${intake.id}`);
  try {
    restoreIntakeRow(intake);
  } catch (err) {
    log.error(`Failed to restore intake ${intake.id}`, err);
    throw err;
  }
}
