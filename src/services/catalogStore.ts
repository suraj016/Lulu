import type { Collection, Product } from '../types/product.ts';

export type CatalogMappingIssue = {
  productId: string;
  handle: string;
  title: string;
  missingProductType: boolean;
  missingTags: boolean;
  unmappedCategory: boolean;
  unmappedProductType: boolean;
  withoutCollections: boolean;
};

export type CatalogSnapshot = {
  products: Product[];
  collections: Collection[];
  mappingIssues: CatalogMappingIssue[];
};

let catalog: CatalogSnapshot | null = null;

export function replaceCatalog(snapshot: CatalogSnapshot): void {
  catalog = snapshot;
}

export function getCatalogSnapshot(): CatalogSnapshot {
  if (!catalog) {
    throw new Error(
      'Produktkataloget er ikke indlæst. Shopify Storefront-kataloget skal hentes, før siden vises.',
    );
  }
  return catalog;
}

export function getCatalogProducts(): Product[] {
  return catalog?.products ?? [];
}

export function getCatalogCollections(): Collection[] {
  return catalog?.collections ?? [];
}

export function getCatalogMappingIssues(): CatalogMappingIssue[] {
  return getCatalogSnapshot().mappingIssues;
}

export function isCatalogLoaded(): boolean {
  return catalog !== null;
}

export function resetCatalog(): void {
  catalog = null;
}
