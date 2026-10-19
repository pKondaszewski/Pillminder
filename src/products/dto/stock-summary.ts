export type StockSummary =
  | { kind: 'bar'; daysLeft: number; label: string }
  | { kind: 'caption'; label: string };
