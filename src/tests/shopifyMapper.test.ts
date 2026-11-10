import { describe, expect, it } from 'vitest';
import { CurrencyCode, ProductType, UNMAPPED_CATEGORY_ID } from '../types/product.ts';
import {
  mapCategoryId,
  mapProductType,
  mapShopifyCatalog,
  mapShopifyProduct,
  moneyToMinorUnits,
} from '../services/shopifyMapper.ts';
import type {
  ShopifyCollectionRecord,
  ShopifyProduct,
} from '../services/shopifyStorefront.ts';

function product(overrides: Partial<ShopifyProduct> = {}): ShopifyProduct {
  return {
    id: 'gid://shopify/Product/1',
    title: 'Original Lulu pink socks',
    handle: 'original-lulu-pink-socks',
    description: 'Bløde sokker med pink mønster.\nVaskes ved 30 grader.',
    productType: '',
    vendor: 'Shop lulu',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    availableForSale: true,
    options: [{ id: 'opt-1', name: 'Size', values: ['Small'] }],
    images: {
      nodes: [
        {
          id: 'gid://shopify/ProductImage/1',
          url: 'https://cdn.shopify.com/s/files/1/pink.jpg',
          altText: 'Pink socks',
          width: 800,
          height: 800,
        },
      ],
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/1',
          title: 'Small',
          sku: 'SOCK-PINK-S',
          availableForSale: true,
          quantityAvailable: 10,
          selectedOptions: [{ name: 'Size', value: 'Small' }],
          price: { amount: '14.99', currencyCode: 'EUR' },
          compareAtPrice: { amount: '19.99', currencyCode: 'EUR' },
          image: null,
        },
      ],
    },
    ...overrides,
  };
}

function collection(
  overrides: Partial<ShopifyCollectionRecord> = {},
): ShopifyCollectionRecord {
  return {
    id: 'gid://shopify/Collection/1',
    handle: 'new-in',
    title: 'New In',
    description: '',
    productIds: ['gid://shopify/Product/1'],
    ...overrides,
  };
}

describe('shopifyMapper', () => {
  it('converts Shopify money to minor units', () => {
    expect(moneyToMinorUnits({ amount: '14.99', currencyCode: 'EUR' })).toBe(1499);
  });

  it('maps a product without inventing collection membership from its title', () => {
    const mapped = mapShopifyProduct(product());

    expect(mapped.slug).toBe('original-lulu-pink-socks');
    expect(mapped.collectionIds).toEqual([]);
    expect(mapped.productType).toBe(ProductType.Unmapped);
    expect(mapped.categoryId).toBe(UNMAPPED_CATEGORY_ID);
    expect(mapped.currency).toBe(CurrencyCode.Eur);
    expect(mapped.priceAmount).toBe(1499);
    expect(mapped.colors).toContain('pink');
    expect(mapped.variants[0]?.size).toBe('Small');
  });

  it('maps socks from Shopify productType, not from the title', () => {
    const mapped = mapShopifyProduct(
      product({ productType: 'Sokker' }),
    );
    expect(mapped.productType).toBe(ProductType.Socks);
    expect(mapped.categoryId).toBe('sokker');
    expect(mapped.collectionIds).toEqual([]);
  });

  it('maps collection membership and aliases from Shopify collections', () => {
    const catalog = mapShopifyCatalog(
      [product()],
      [collection({ handle: 'new-in', productIds: ['gid://shopify/Product/1'] })],
    );
    const mapped = catalog.products[0];

    expect(mapped?.collectionIds).toEqual(['new-in', 'new-arrivals']);
    expect(mapped?.isNew).toBe(true);
    expect(catalog.collections[0]?.slug).toBe('new-in');
    expect(catalog.collections[0]?.name).toBe('Nyheder');
    expect(catalog.collections[0]?.productIds).toEqual(['gid://shopify/Product/1']);
  });

  it('does not assign products to collections they are not in', () => {
    const catalog = mapShopifyCatalog(
      [product({ id: 'gid://shopify/Product/2', handle: 'gift-card', title: 'Gift card' })],
      [collection({ handle: 'sokker', productIds: ['gid://shopify/Product/1'] })],
    );

    expect(catalog.products[0]?.collectionIds).toEqual([]);
    expect(catalog.products[0]?.productType).toBe(ProductType.Unmapped);
  });

  it('maps gift-card denominations as selectable sizes and keeps them purchasable without inventory', () => {
    const mapped = mapShopifyProduct(
      product({
        title: 'Shoplulu Gift card',
        handle: 'shop-lulu-gift-card',
        description: 'Gavekort til shoppen.',
        options: [{ id: 'opt-d', name: 'Denominations', values: ['25.00', '50.00'] }],
        variants: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/25',
              title: '25.00',
              sku: '',
              availableForSale: true,
              quantityAvailable: 0,
              selectedOptions: [{ name: 'Denominations', value: '25.00' }],
              price: { amount: '25.00', currencyCode: 'EUR' },
              compareAtPrice: null,
              image: null,
            },
          ],
        },
      }),
    );

    expect(mapped.variants[0]?.size).toBe('25.00');
    expect(mapped.variants[0]?.isAvailable).toBe(true);
    expect(mapped.variants[0]?.inventory.trackQuantity).toBe(false);
  });

  it('records mapping issues when Shopify type, tags, and collections are missing', () => {
    const catalog = mapShopifyCatalog([product()], []);
    expect(catalog.mappingIssues[0]).toMatchObject({
      handle: 'original-lulu-pink-socks',
      missingProductType: true,
      missingTags: true,
      unmappedCategory: true,
      unmappedProductType: true,
      withoutCollections: true,
    });
  });
});

describe('mapProductType and mapCategoryId', () => {
  it('uses collection membership when productType and tags are empty', () => {
    expect(
      mapProductType({
        productType: '',
        tags: [],
        collectionKeys: ['sokker'],
      }),
    ).toBe(ProductType.Socks);
    expect(
      mapCategoryId({
        productType: ProductType.Socks,
        tags: [],
        shopifyProductType: '',
        collectionKeys: ['sokker'],
      }),
    ).toBe('sokker');
  });

  it('does not invent a category from an unrelated collection', () => {
    expect(
      mapProductType({
        productType: '',
        tags: [],
        collectionKeys: ['frontpage', 'new-in', 'new-arrivals'],
      }),
    ).toBe(ProductType.Unmapped);
    expect(
      mapCategoryId({
        productType: ProductType.Unmapped,
        tags: [],
        shopifyProductType: '',
        collectionKeys: ['frontpage', 'most-popular', 'popular-3d'],
      }),
    ).toBe(UNMAPPED_CATEGORY_ID);
  });
});
