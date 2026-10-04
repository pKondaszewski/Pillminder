export interface AdherenceCounts {
  taken: number;
  skipped: number;
  missed: number;
  upcoming: number;
  due: number;
  rate: number | null;
}

export interface AdherenceReport {
  total: AdherenceCounts;
  byProduct: Record<string, AdherenceCounts>;
}
