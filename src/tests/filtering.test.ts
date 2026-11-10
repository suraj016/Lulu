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

  it('excludes unavailable products when the in-stock filter is on', () => {
    const available = allProducts[0]!;
    const unavailable = {
      ...available,
      id: 'oos-product',
      variants: available.variants.map((variant) => ({
        ...variant,
        isAvailable: false,
        inventory: {
          trackQuantity: true,
          availableQuantity: 0,
          allowBackorder: false,
        },
      })),
      inventory: {
        trackQuantity: true,
        availableQuantity: 0,
        allowBackorder: false,
      },
    };

    const result = filterProducts([available, unavailable], {
      ...base,
      inStock: true,
    });
    expect(result.map((item) => item.id)).toEqual([available.id]);
  });

  it('matches search terms against name and slug without regard to case', () => {
    const byName = filterProducts(allProducts, { ...base, query: 'BIL' });
    const bySlug = filterProducts(allProducts, {
      ...base,
      query: 'bil-klassisk',
    });
    expect(byName.some((item) => item.id === 'bil-klassisk')).toBe(true);
    expect(bySlug.some((item) => item.id === 'bil-klassisk')).toBe(true);
  });
});
