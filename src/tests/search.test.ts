import { describe, expect, it } from 'vitest';
import { searchProducts } from '../services/productService.ts';

describe('search', () => {
  it('finds products by Danish name regardless of case', () => {
    const results = searchProducts('BIL');
    expect(results.some((item) => item.id === 'bil-klassisk')).toBe(true);
  });

  it('returns an empty list for unknown terms', () => {
    expect(searchProducts('xyz-ukendt-produkt')).toEqual([]);
  });
});
