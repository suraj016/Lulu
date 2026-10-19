import { describe, expect, it } from 'vitest';
import { allProducts } from '../data/mockProducts.ts';
import { ProductType } from '../types/product.ts';
import { filterProducts } from '../utils/filtering.ts';

const base = {
  colors: [] as string[],
  materials: [] as string[],
};

describe('filtering', () => {
  it('filters by category and color together', () => {
    const result = filterProducts(allProducts, {
      ...base,
      categoryId: 'legetoj',
      colors: ['green'],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.categoryId === 'legetoj')).toBe(true);
    expect(result.every((item) => item.colors.includes('green'))).toBe(true);
  });

  it('filters by price interval', () => {
    const result = filterProducts(allProducts, {
      ...base,
      minPriceOre: 10000,
      maxPriceOre: 15000,
    });
    expect(result.every((item) => item.priceAmount >= 10000)).toBe(true);
    expect(result.every((item) => item.priceAmount <= 15000)).toBe(true);
  });

  it('filters by product type', () => {
    const socks = filterProducts(allProducts, {
      ...base,
      productType: ProductType.Socks,
    });
    expect(socks.length).toBeGreaterThan(0);
    expect(socks.every((item) => item.productType === ProductType.Socks)).toBe(
      true,
    );
  });
});
