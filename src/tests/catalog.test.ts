import { describe, expect, it } from 'vitest';
import { collections } from '../data/mockCollections.ts';
import { allProducts } from '../data/mockProducts.ts';
import {
  getCatalogProducts,
  replaceCatalog,
  resetCatalog,
} from '../services/catalogStore.ts';
import {
  getPriceBounds,
  getProductBySlug,
  getProducts,
} from '../services/productService.ts';
import { CurrencyCode, ProductType, SortKey } from '../types/product.ts';
import {
  catalogQueryFromSearch,
  catalogQueryToSearch,
  countActiveFilters,
} from '../utils/catalogUrl.ts';

const emptyFilters = {
  colors: [] as string[],
  materials: [] as string[],
  sort: SortKey.Popular,
  page: 1,
  pageSize: 12,
};

describe('catalog lookups', () => {
  it('returns an empty product list before the catalog is loaded', () => {
    resetCatalog();
    try {
      expect(getCatalogProducts()).toEqual([]);
    } finally {
      replaceCatalog({
        products: allProducts,
        collections,
        mappingIssues: [],
      });
    }
  });

  it('returns undefined for an unknown product slug', () => {
    expect(getProductBySlug('findes-ikke')).toBeUndefined();
  });

  it('exposes catalog price bounds in the catalog currency', () => {
    const bounds = getPriceBounds();
    expect(bounds.max).toBeGreaterThanOrEqual(bounds.min);
    expect(bounds.currency).toBe(CurrencyCode.Dkk);
  });

  it('returns an empty result for a collection with no matching products', () => {
    const result = getProducts({
      ...emptyFilters,
      collectionId: 'collection-that-does-not-exist',
    });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('applies sorting after filtering', () => {
    const result = getProducts({
      ...emptyFilters,
      productType: ProductType.Socks,
      sort: SortKey.PriceAsc,
    });
    expect(result.total).toBeGreaterThan(1);
    const prices = result.items.map((item) => item.priceAmount);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

describe('catalog query URLs', () => {
  it('parses and serializes shop filters without inventing values', () => {
    const query = catalogQueryFromSearch(
      '?q=sokker&colors=pink&stock=1&sort=price-asc&page=2',
    );
    expect(query.query).toBe('sokker');
    expect(query.colors).toEqual(['pink']);
    expect(query.inStock).toBe(true);
    expect(query.sort).toBe(SortKey.PriceAsc);
    expect(query.page).toBe(2);
    expect(countActiveFilters(query)).toBe(3);

    const search = catalogQueryToSearch({
      ...query,
      minPriceOre: undefined,
      maxPriceOre: undefined,
      materials: [],
      categoryId: undefined,
      isNew: undefined,
    });
    expect(search).toContain('q=sokker');
    expect(search).toContain('colors=pink');
    expect(search).toContain('stock=1');
    expect(search).toContain('sort=price-asc');
  });

  it('treats empty search as no query filter', () => {
    const query = catalogQueryFromSearch('');
    expect(query.query).toBeUndefined();
    expect(countActiveFilters(query)).toBe(0);
  });
});
