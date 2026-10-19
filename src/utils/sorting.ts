import { SortKey, type Product } from '../types/product.ts';
import { resolvePrice } from './pricing.ts';

const collator = new Intl.Collator('da-DK', { sensitivity: 'base' });

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const next = [...products];

  next.sort((a, b) => {
    switch (sort) {
      case SortKey.PriceAsc:
        return resolvePrice(a).amount - resolvePrice(b).amount;
      case SortKey.PriceDesc:
        return resolvePrice(b).amount - resolvePrice(a).amount;
      case SortKey.Newest:
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      case SortKey.NameAsc:
        return collator.compare(a.name, b.name);
      case SortKey.Popular:
      default: {
        const featured = Number(b.isFeatured) - Number(a.isFeatured);
        if (featured !== 0) {
          return featured;
        }
        const bestseller = Number(b.isBestSeller) - Number(a.isBestSeller);
        if (bestseller !== 0) {
          return bestseller;
        }
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      }
    }
  });

  return next;
}
