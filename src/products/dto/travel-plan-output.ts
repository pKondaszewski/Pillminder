export type TravelStockVerdict =
  | 'enough'
  | 'runsOutDuringTrip'
  | 'runsOutAfterReturn';

export interface TravelPlanEntry {
  id: string;
  title: string;
  pack: string;
  verdict: TravelStockVerdict | null;
}
