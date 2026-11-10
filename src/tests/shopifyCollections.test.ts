import { afterEach, describe, expect, it } from 'vitest';
import { collections as mockCollections } from '../data/mockCollections.ts';
import { allProducts } from '../data/mockProducts.ts';
import {
  getCollection,
  getNewArrivals,
  getProducts,
  getProductsByCollection,
} from '../services/productService.ts';
import { replaceCatalog } from '../services/catalogStore.ts';
import {
  collectionKeysForHandle,
  mapShopifyCatalog,
} from '../services/shopifyMapper.ts';
import type {
  ShopifyCollectionRecord,
  ShopifyProduct,
} from '../services/shopifyStorefront.ts';
import { ProductType, SortKey } from '../types/product.ts';

function shopifyProduct(
  id: string,
  handle: string,
  title: string,
): ShopifyProduct {
  return {
    id,
    title,
    handle,
    description: title,
    productType: '',
    vendor: 'Shop lulu',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    availableForSale: true,
    options: [],
    images: { nodes: [] },
    variants: {
      nodes: [
        {
          id: `${id}/variant`,
          title: 'Default Title',
          sku: '',
          availableForSale: true,
          quantityAvailable: 3,
          selectedOptions: [],
          price: { amount: '12.00', currencyCode: 'EUR' },
          compareAtPrice: null,
          image: null,
        },
      ],
    },
  };
}

describe('collection handle aliases', () => {
  it('maps Shopify handles onto existing UI collection slugs', () => {
    expect(collectionKeysForHandle('new-in')).toEqual(['new-in', 'new-arrivals']);
    expect(collectionKeysForHandle('most-popular')).toEqual([
      'most-popular',
      'popular-3d',
    ]);
    expect(collectionKeysForHandle('frontpage')).toEqual(['frontpage']);
  });
});

describe('live collection membership', () => {
  afterEach(() => {
    replaceCatalog({
      products: allProducts,
      collections: mockCollections,
      mappingIssues: [],
    });
  });

  it('keeps homepage sections tied to Shopify collections, not title heuristics', () => {
    const products = [
      shopifyProduct('gid://shopify/Product/1', 'pink-socks', 'Pink socks'),
      shopifyProduct('gid://shopify/Product/2', 'gift-card', 'Shoplulu Gift card'),
    ];
    const collections: ShopifyCollectionRecord[] = [
      {
        id: 'gid://shopify/Collection/1',
        handle: 'most-popular',
        title: 'Most Popular',
        description: '',
        productIds: ['gid://shopify/Product/1'],
      },
      {
        id: 'gid://shopify/Collection/2',
        handle: 'new-in',
        title: 'New In',
        description: '',
        productIds: ['gid://shopify/Product/1'],
      },
    ];

    const mapped = mapShopifyCatalog(products, collections);
    replaceCatalog(mapped);

    expect(getProductsByCollection('popular-3d').map((item) => item.slug)).toEqual([
      'pink-socks',
    ]);
    expect(getNewArrivals().map((item) => item.slug)).toEqual(['pink-socks']);
    expect(getCollection('new-arrivals')?.productIds).toEqual([
      'gid://shopify/Product/1',
    ]);
    expect(getCollection('sokker')?.productIds).toEqual([]);
    expect(
      getProducts({
        collectionId: 'sokker',
        productType: ProductType.Socks,
        colors: [],
        materials: [],
        sort: SortKey.Popular,
        page: 1,
        pageSize: 12,
      }).total,
    ).toBe(0);
  });

  it('preserves Shopify collection product order on homepage sections', () => {
    const first = shopifyProduct('gid://shopify/Product/1', 'first-socks', 'First socks');
    const second = shopifyProduct('gid://shopify/Product/2', 'second-socks', 'Second socks');
    const mapped = mapShopifyCatalog(
      [first, second],
      [
        {
          id: 'gid://shopify/Collection/1',
          handle: 'most-popular',
          title: 'Most Popular',
          description: '',
          productIds: ['gid://shopify/Product/2', 'gid://shopify/Product/1'],
        },
      ],
    );
    replaceCatalog(mapped);

    expect(getProductsByCollection('popular-3d').map((item) => item.slug)).toEqual([
      'second-socks',
      'first-socks',
    ]);
  });
});
