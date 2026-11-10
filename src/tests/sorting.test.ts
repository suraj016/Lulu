import { describe, expect, it } from 'vitest';
import { allProducts } from '../data/mockProducts.ts';
import { SortKey } from '../types/product.ts';
import { sortProducts } from '../utils/sorting.ts';

describe('sorting', () => {
  it('sorts by price ascending and descending', () => {
    const asc = sortProducts(allProducts, SortKey.PriceAsc);
    const desc = sortProducts(allProducts, SortKey.PriceDesc);
    expect(asc[0]!.priceAmount).toBeLessThanOrEqual(asc[1]!.priceAmount);
    expect(desc[0]!.priceAmount).toBeGreaterThanOrEqual(desc[1]!.priceAmount);
  });

  it('sorts names with Danish collation', () => {
    const named = sortProducts(allProducts, SortKey.NameAsc);
    const names = named.map((item) => item.name);
    const copy = [...names].sort(new Intl.Collator('da-DK').compare);
    expect(names).toEqual(copy);
  });

  it('sorts newest using Shopify createdAt timestamps', () => {
    const newest = sortProducts(allProducts, SortKey.Newest);
    const timestamps = newest.map((item) => Date.parse(item.createdAt));
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it('uses featured and bestseller flags for the default popular sort', () => {
    const popular = sortProducts(allProducts, SortKey.Popular);
    const firstFeatured = popular.findIndex((item) => item.isFeatured);
    const firstUnfeatured = popular.findIndex((item) => !item.isFeatured);
    if (firstFeatured !== -1 && firstUnfeatured !== -1) {
      expect(firstFeatured).toBeLessThan(firstUnfeatured);
    }
  });
});
