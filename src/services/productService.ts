import { getCategoryById } from '../data/mockCategories.ts';
import {
  collectionPresentation,
  presentedShopRoutes,
} from '../data/collectionPresentation.ts';
import { messages } from '../data/messages.ts';
import {
  CurrencyCode,
  ProductStatus,
  UNMAPPED_CATEGORY_ID,
  type CatalogQuery,
  type CatalogResult,
  type Collection,
  type Product,
} from '../types/product.ts';
import { filterProducts, matchesQuery } from '../utils/filtering.ts';
import { paginate } from '../utils/pagination.ts';
import { sortProducts } from '../utils/sorting.ts';
import {
  getCatalogCollections,
  getCatalogMappingIssues,
  getCatalogProducts,
  replaceCatalog,
} from './catalogStore.ts';
import { collectionKeysForHandle } from './shopifyMapper.ts';
import { fetchStorefrontCatalog } from './shopifyStorefront.ts';

/**
 * Catalog access boundary. Pages and components should call these
 * functions instead of importing catalog arrays. Live data comes from
 * Shopify Storefront API after `loadProductCatalog()`.
 */
let catalogLoad: Promise<Product[]> | null = null;

function overlayPresentation(collection: Collection, slug: string): Collection {
  const keys = [...collectionKeysForHandle(collection.slug), slug];
  const presentation = keys
    .map((key) => collectionPresentation[key])
    .find(Boolean);
  if (!presentation) {
    return collection;
  }
  return {
    ...collection,
    slug,
    name: presentation.name,
    description: presentation.description || collection.description,
    heroImageId: presentation.heroImageId ?? collection.heroImageId,
  };
}

export async function loadProductCatalog(): Promise<Product[]> {
  if (catalogLoad) {
    return catalogLoad;
  }

  catalogLoad = fetchStorefrontCatalog()
    .then((snapshot) => {
      replaceCatalog(snapshot);
      if (import.meta.env.DEV) {
        const issues = snapshot.mappingIssues;
        const unmapped = issues.filter((issue) => issue.unmappedCategory).length;
        const withoutCollections = issues.filter(
          (issue) => issue.withoutCollections,
        ).length;
        console.info(
          `[Shopify] Indlæste ${snapshot.products.length} produkter og ${snapshot.collections.length} kollektioner.`,
        );
        if (unmapped > 0 || withoutCollections > 0) {
          console.info(
            `[Shopify] Mapping: ${unmapped} uden kategori, ${withoutCollections} uden kollektion.`,
          );
        }
      }
      return snapshot.products;
    })
    .catch((error: unknown) => {
      catalogLoad = null;
      throw error;
    });

  return catalogLoad;
}

function activeCatalog(): Product[] {
  return getCatalogProducts().filter(
    (product) => product.status === ProductStatus.Active,
  );
}

export function getProducts(query: CatalogQuery): CatalogResult {
  const filtered = filterProducts(getCatalogProducts(), query);
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
  return getCatalogProducts().find((product) => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getCatalogProducts().find((product) => product.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return getProductsByCollection('popular-3d').slice(0, 8);
}

export function getNewArrivals(): Product[] {
  return getProductsByCollection('new-arrivals').slice(0, 8);
}

export function getProductsByCollection(collectionId: string): Product[] {
  const catalog = activeCatalog();
  const collection = getCollection(collectionId);
  if (collection && collection.productIds.length > 0) {
    const byId = new Map(catalog.map((product) => [product.id, product]));
    return collection.productIds
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product));
  }

  return catalog.filter((product) =>
    product.collectionIds.includes(collectionId),
  );
}

export function getCollection(slug: string): Collection | undefined {
  const live = getCatalogCollections();
  const exact = live.find((collection) => collection.slug === slug);
  if (exact) {
    return overlayPresentation(exact, slug);
  }

  const aliased = live.find((collection) =>
    collectionKeysForHandle(collection.slug).includes(slug),
  );
  if (aliased) {
    return overlayPresentation(aliased, slug);
  }

  if ((presentedShopRoutes as readonly string[]).includes(slug)) {
    const presentation = collectionPresentation[slug];
    if (!presentation) {
      return undefined;
    }
    return {
      id: slug,
      slug,
      name: presentation.name,
      description: presentation.description,
      productIds: [],
      heroImageId: presentation.heroImageId,
    };
  }

  return undefined;
}

export function searchProducts(query: string, limit = 8): Product[] {
  const term = query.trim();
  if (!term) {
    return [];
  }
  return getCatalogProducts()
    .filter((product) => product.status === 'active' && matchesQuery(product, term))
    .slice(0, limit);
}

export function getComplementaryProducts(product: Product): Product[] {
  return product.complementaryProductIds
    .map((id) => getProductById(id))
    .filter((item): item is Product => Boolean(item));
}

export function getCategoryName(categoryId: string): string {
  if (categoryId === UNMAPPED_CATEGORY_ID) {
    return messages.catalog.unmappedCategory;
  }
  return getCategoryById(categoryId)?.name ?? categoryId;
}

export function getDefaultVariant(product: Product) {
  return (
    product.variants.find((variant) => variant.isAvailable) ??
    product.variants[0]
  );
}

export function getPriceBounds(): {
  min: number;
  max: number;
  currency: CurrencyCode;
} {
  const products = activeCatalog();
  if (products.length === 0) {
    return { min: 0, max: 0, currency: CurrencyCode.Dkk };
  }
  const prices = products.map((product) => product.priceAmount);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency: products[0]?.currency ?? CurrencyCode.Dkk,
  };
}

export function getMappingIssues() {
  return getCatalogMappingIssues();
}
