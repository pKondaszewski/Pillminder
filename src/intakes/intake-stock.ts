export function adjustedStock(stock: number, delta: number): number {
  return Math.max(0, stock + delta);
}
