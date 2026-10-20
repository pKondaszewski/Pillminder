export type TravelStockVerdict =
  | 'enough'
  | 'runsOutDuringTrip'
  | 'runsOutAfterReturn';

export interface TravelPlanEntry {
  id: string;
  name: string;
  title: string;
  pack: string;
  verdict: TravelStockVerdict | null;
  runOutOffsetDays: number | null;
}
