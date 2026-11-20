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
    expect(collectionKeysForHandle('most-popular')).toEqual(['most-popular']);
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

  it('keeps 3D homepage sections on printed products, not socks in most-popular', () => {
    const socks = shopifyProduct('gid://shopify/Product/1', 'pink-socks', 'Pink socks');
    socks.options = [{ name: 'Size', values: ['Small'] }];
    socks.variants.nodes[0]!.selectedOptions = [{ name: 'Size', value: 'Small' }];

    const lys = shopifyProduct('gid://shopify/Product/3', 'lys', 'Lys');
    lys.options = [{ name: 'Color', values: ['Beige'] }];
    lys.variants.nodes[0]!.selectedOptions = [{ name: 'Color', value: 'Beige' }];

    const products = [
      socks,
      shopifyProduct('gid://shopify/Product/2', 'gift-card', 'Shoplulu Gift card'),
      lys,
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

    expect(getProductsByCollection('popular-3d').map((item) => item.slug)).toEqual(['lys']);
    expect(getNewArrivals().map((item) => item.slug)).toEqual(['pink-socks']);
    expect(getCollection('new-arrivals')?.productIds).toEqual([
      'gid://shopify/Product/1',
    ]);
    expect(getProductsByCollection('sokker').map((item) => item.slug)).toEqual([
      'pink-socks',
    ]);
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
    ).toBe(1);
  });

  it('preserves Shopify collection product order for new arrivals', () => {
    const first = shopifyProduct('gid://shopify/Product/1', 'first-socks', 'First socks');
    first.options = [{ name: 'Size', values: ['Small'] }];
    first.variants.nodes[0]!.selectedOptions = [{ name: 'Size', value: 'Small' }];
    const second = shopifyProduct('gid://shopify/Product/2', 'second-socks', 'Second socks');
    second.options = [{ name: 'Size', values: ['Small'] }];
    second.variants.nodes[0]!.selectedOptions = [{ name: 'Size', value: 'Small' }];
    const mapped = mapShopifyCatalog(
      [first, second],
      [
        {
          id: 'gid://shopify/Collection/1',
          handle: 'new-in',
          title: 'New In',
          description: '',
          productIds: ['gid://shopify/Product/2', 'gid://shopify/Product/1'],
        },
      ],
    );
    replaceCatalog(mapped);

    expect(getProductsByCollection('new-arrivals').map((item) => item.slug)).toEqual([
      'second-socks',
      'first-socks',
    ]);
  });
});
