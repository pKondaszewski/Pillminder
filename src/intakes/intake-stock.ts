export function adjustedStock(stock: number, delta: number): number {
  return Math.max(0, stock + delta);
}

export function isValidIntakeQuantity(quantity: number): boolean {
  return Number.isSafeInteger(quantity) && quantity >= 1;
}
