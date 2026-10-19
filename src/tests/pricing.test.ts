import { describe, expect, it } from 'vitest';
import { allProducts } from '../data/mockProducts.ts';
import { lineTotal, resolvePrice, sumAmounts } from '../utils/pricing.ts';

describe('pricing', () => {
  it('calculates sale savings from integer øre values', () => {
    const product = allProducts.find((item) => item.id === 'gavehaeng');
    expect(product).toBeTruthy();
    const price = resolvePrice(product!);
    expect(price.amount).toBe(4900);
    expect(price.compareAtAmount).toBe(6900);
    expect(price.savingsAmount).toBe(2000);
    expect(price.isOnSale).toBe(true);
  });

  it('does not invent a sale when compare-at is missing', () => {
    const product = allProducts.find((item) => item.id === 'bil-klassisk');
    const price = resolvePrice(product!);
    expect(price.isOnSale).toBe(false);
    expect(price.savingsAmount).toBe(0);
  });

  it('sums line totals', () => {
    expect(lineTotal(14900, 2)).toBe(29800);
    expect(sumAmounts([14900, 7900])).toBe(22800);
  });
});
