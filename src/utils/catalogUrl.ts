import {
  ProductType,
  SortKey,
  type CatalogQuery,
} from '../types/product.ts';

const DEFAULT_PAGE_SIZE = 12;

function readNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readList(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function catalogQueryFromSearch(
  search: string,
  defaults: Partial<CatalogQuery> = {},
): CatalogQuery {
  const params = new URLSearchParams(search);
  const sortValue = params.get('sort');
  const sort =
    sortValue && Object.values(SortKey).includes(sortValue as SortKey)
      ? (sortValue as SortKey)
      : (defaults.sort ?? SortKey.Popular);

  const productTypeValue = params.get('type');
  const productType =
    productTypeValue &&
    Object.values(ProductType).includes(productTypeValue as ProductType)
      ? (productTypeValue as ProductType)
      : defaults.productType;

  return {
    collectionId: params.get('collection') ?? defaults.collectionId,
    categoryId: params.get('category') ?? defaults.categoryId,
    minPriceOre: readNumber(params.get('min')) ?? defaults.minPriceOre,
    maxPriceOre: readNumber(params.get('max')) ?? defaults.maxPriceOre,
    colors: readList(params.get('colors')),
    materials: readList(params.get('materials')),
    isNew: params.get('new') === '1' ? true : undefined,
    inStock: params.get('stock') === '1' ? true : undefined,
    productType,
    query: params.get('q') ?? defaults.query,
    sort,
    page: Math.max(1, readNumber(params.get('page')) ?? 1),
    pageSize: defaults.pageSize ?? DEFAULT_PAGE_SIZE,
  };
}

export function catalogQueryToSearch(query: CatalogQuery): string {
  const params = new URLSearchParams();

  if (query.categoryId) {
    params.set('category', query.categoryId);
  }
  if (typeof query.minPriceOre === 'number') {
    params.set('min', String(query.minPriceOre));
  }
  if (typeof query.maxPriceOre === 'number') {
    params.set('max', String(query.maxPriceOre));
  }
  if (query.colors.length > 0) {
    params.set('colors', query.colors.join(','));
  }
  if (query.materials.length > 0) {
    params.set('materials', query.materials.join(','));
  }
  if (query.isNew) {
    params.set('new', '1');
  }
  if (query.inStock) {
    params.set('stock', '1');
  }
  if (query.productType) {
    params.set('type', query.productType);
  }
  if (query.query) {
    params.set('q', query.query);
  }
  if (query.sort !== SortKey.Popular) {
    params.set('sort', query.sort);
  }
  if (query.page > 1) {
    params.set('page', String(query.page));
  }

  return params.toString();
}

export function countActiveFilters(query: CatalogQuery): number {
  return [
    Boolean(query.categoryId),
    typeof query.minPriceOre === 'number',
    typeof query.maxPriceOre === 'number',
    query.colors.length > 0,
    query.materials.length > 0,
    Boolean(query.isNew),
    Boolean(query.inStock),
    Boolean(query.query),
  ].filter(Boolean).length;
}
