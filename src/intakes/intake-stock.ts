export function deductedQuantity(
  stock: number | null,
  quantity: number,
): number | null {
  return stock === null ? null : Math.min(stock, quantity);
}

export function adjustedStock(stock: number, delta: number): number {
  return Math.max(0, stock + delta);
}
