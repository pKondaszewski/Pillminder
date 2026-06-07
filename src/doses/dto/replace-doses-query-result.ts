import type { Dose } from '../dose-repository';

export interface ReplaceDosesQueryResult {
  removedIds: string[];
  inserted: Dose[];
}
