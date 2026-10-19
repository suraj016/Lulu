import type { Product, ProductVariant } from '../types/product.ts';

export type ResolvedPrice = {
  amount: number;
  compareAtAmount?: number;
  savingsAmount: number;
  isOnSale: boolean;
  currency: Product['currency'];
};

export function resolvePrice(
  product: Product,
  variant?: ProductVariant,
): ResolvedPrice {
  const amount = variant?.priceOverride ?? product.priceAmount;
  const compareAtAmount =
    variant?.compareAtPriceOverride ?? product.compareAtPriceAmount;
  const hasCompare =
    typeof compareAtAmount === 'number' && compareAtAmount > amount;
  const savingsAmount = hasCompare ? compareAtAmount - amount : 0;

  return {
    amount,
    compareAtAmount: hasCompare ? compareAtAmount : undefined,
    savingsAmount,
    isOnSale: savingsAmount > 0,
    currency: product.currency,
  };
}

export function lineTotal(unitOre: number, quantity: number): number {
  if (quantity < 0) {
    return 0;
  }
  return unitOre * quantity;
}

export function sumAmounts(amounts: number[]): number {
  return amounts.reduce((total, value) => total + value, 0);
}
