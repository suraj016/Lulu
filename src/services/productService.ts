import { getCategoryById } from '../data/mockCategories.ts';
import { getCollectionById, getCollectionBySlug } from '../data/mockCollections.ts';
import { allProducts } from '../data/mockProducts.ts';
import type {
  CatalogQuery,
  CatalogResult,
  Collection,
  Product,
} from '../types/product.ts';
import { filterProducts, matchesQuery } from '../utils/filtering.ts';
import { paginate } from '../utils/pagination.ts';
import { sortProducts } from '../utils/sorting.ts';

/**
 * Catalog access boundary. Pages and components should call these
 * functions instead of importing mock arrays. A future HTTP client
 * can replace this module without changing the UI.
 */
export function getProducts(query: CatalogQuery): CatalogResult {
  const filtered = filterProducts(allProducts, query);
  const sorted = sortProducts(filtered, query.sort);
  const page = paginate(sorted, query.page, query.pageSize);

  return {
    items: page.items,
    total: page.total,
    page: page.page,
    pageSize: query.pageSize,
    pageCount: page.pageCount,
  };
}

export function getProductById(id: string): Product | undefined {
  return allProducts.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return getProductsByCollection('popular-3d');
}

export function getNewArrivals(): Product[] {
  return getProductsByCollection('new-arrivals');
}

export function getProductsByCollection(collectionId: string): Product[] {
  const collection = getCollectionById(collectionId);
  if (!collection) {
    return [];
  }
  return collection.productIds
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product));
}

export function getCollection(slug: string): Collection | undefined {
  return getCollectionBySlug(slug);
}

export function searchProducts(query: string, limit = 8): Product[] {
  const term = query.trim();
  if (!term) {
    return [];
  }
  return allProducts
    .filter((product) => product.status === 'active' && matchesQuery(product, term))
    .slice(0, limit);
}

export function getComplementaryProducts(product: Product): Product[] {
  return product.complementaryProductIds
    .map((id) => getProductById(id))
    .filter((item): item is Product => Boolean(item));
}

export function getCategoryName(categoryId: string): string {
  return getCategoryById(categoryId)?.name ?? categoryId;
}

export function getDefaultVariant(product: Product) {
  return (
    product.variants.find((variant) => variant.isAvailable) ??
    product.variants[0]
  );
}

export function getPriceBounds(): { min: number; max: number } {
  const prices = allProducts
    .filter((product) => product.status === 'active')
    .map((product) => product.priceAmount);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
