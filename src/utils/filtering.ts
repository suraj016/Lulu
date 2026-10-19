import type { CatalogFilters, Product } from '../types/product.ts';
import { resolvePrice } from './pricing.ts';
import { isVariantPurchasable } from './inventory.ts';

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('da-DK');
}

export function matchesQuery(product: Product, query?: string): boolean {
  const term = query ? normalize(query) : '';
  if (!term) {
    return true;
  }

  const haystack = [
    product.name,
    product.shortDescription,
    product.description,
    product.categoryId,
    ...product.tags,
    ...product.colors,
    ...product.materials,
    ...product.variants.map((variant) => variant.label),
    ...product.variants.map((variant) => variant.colorName ?? ''),
  ]
    .join(' ')
    .toLocaleLowerCase('da-DK');

  return haystack.includes(term);
}

export function filterProducts(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  return products.filter((product) => {
    if (product.status !== 'active') {
      return false;
    }

    if (
      filters.collectionId &&
      !product.collectionIds.includes(filters.collectionId)
    ) {
      return false;
    }

    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.productType && product.productType !== filters.productType) {
      return false;
    }

    if (filters.isNew && !product.isNew) {
      return false;
    }

    if (filters.inStock) {
      const anyAvailable =
        product.variants.length === 0
          ? isVariantPurchasable(product)
          : product.variants.some((variant) =>
              isVariantPurchasable(product, variant),
            );
      if (!anyAvailable) {
        return false;
      }
    }

    if (filters.colors.length > 0) {
      const productColors = product.colors.map(normalize);
      const hasColor = filters.colors.some((color) =>
        productColors.includes(normalize(color)),
      );
      if (!hasColor) {
        return false;
      }
    }

    if (filters.materials.length > 0) {
      const productMaterials = product.materials.map(normalize);
      const hasMaterial = filters.materials.some((material) =>
        productMaterials.includes(normalize(material)),
      );
      if (!hasMaterial) {
        return false;
      }
    }

    const price = resolvePrice(product).amount;
    if (
      typeof filters.minPriceOre === 'number' &&
      price < filters.minPriceOre
    ) {
      return false;
    }
    if (
      typeof filters.maxPriceOre === 'number' &&
      price > filters.maxPriceOre
    ) {
      return false;
    }

    if (!matchesQuery(product, filters.query)) {
      return false;
    }

    return true;
  });
}
