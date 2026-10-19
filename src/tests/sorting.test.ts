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
});
