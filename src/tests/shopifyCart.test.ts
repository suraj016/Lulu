import { afterEach, describe, expect, it, vi } from 'vitest';
import { CurrencyCode } from '../types/product.ts';
import {
  CART_CREATE_MUTATION,
  CART_QUERY,
  addShopifyCartLines,
  createShopifyCart,
  ensureShopifyCart,
  fetchShopifyCart,
  isLegacyCartLine,
  isProductVariantMerchandise,
  isShopifyGid,
  isSafeCheckoutUrl,
  isStaleCartError,
  mapShopifyCart,
  resetCartCreateLock,
  unwrapCartMutation,
  type ShopifyCartPayload,
} from '../services/shopifyCartService.ts';
import { ShopifyStorefrontError } from '../services/shopifyStorefront.ts';
import type { StorefrontConfig } from '../services/shopifyStorefront.ts';

const config: StorefrontConfig = {
  domain: 'example.myshopify.com',
  apiVersion: '2026-10',
  publicToken: 'public-storefront-token',
};

function cartPayload(overrides: Partial<ShopifyCartPayload> = {}): ShopifyCartPayload {
  return {
    id: 'gid://shopify/Cart/1',
    checkoutUrl: 'https://example.myshopify.com/cart/c/abc123',
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: '29.98', currencyCode: 'EUR' },
      totalAmount: { amount: '29.98', currencyCode: 'EUR' },
      totalTaxAmount: { amount: '0.0', currencyCode: 'EUR' },
    },
    lines: {
      nodes: [
        {
          id: 'gid://shopify/CartLine/11',
          quantity: 2,
          cost: {
            amountPerQuantity: { amount: '14.99', currencyCode: 'EUR' },
            totalAmount: { amount: '29.98', currencyCode: 'EUR' },
          },
          merchandise: {
            id: 'gid://shopify/ProductVariant/99',
            title: 'Small',
            availableForSale: true,
            product: {
              id: 'gid://shopify/Product/5',
              handle: 'pink-socks',
              title: 'Original Lulu pink socks',
            },
          },
        },
      ],
    },
    ...overrides,
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  resetCartCreateLock();
});

describe('Shopify cart mapping', () => {
  it('maps cart costs, currency, checkout URL, and variant GIDs', () => {
    const mapped = mapShopifyCart(cartPayload());
    expect(mapped.cartId).toBe('gid://shopify/Cart/1');
    expect(mapped.checkoutUrl).toContain('/cart/c/');
    expect(mapped.currency).toBe(CurrencyCode.Eur);
    expect(mapped.subtotalAmount).toBe(2998);
    expect(mapped.totalAmount).toBe(2998);
    expect(mapped.lines).toHaveLength(1);
    expect(mapped.lines[0]?.variantId).toBe('gid://shopify/ProductVariant/99');
    expect(mapped.lines[0]?.productId).toBe('gid://shopify/Product/5');
    expect(mapped.lines[0]?.unitAmount).toBe(1499);
    expect(mapped.lines[0]?.lineAmount).toBe(2998);
  });

  it('ignores non-variant merchandise', () => {
    const mapped = mapShopifyCart(
      cartPayload({
        lines: {
          nodes: [
            {
              id: 'gid://shopify/CartLine/x',
              quantity: 1,
              cost: {
                amountPerQuantity: { amount: '1.00', currencyCode: 'EUR' },
                totalAmount: { amount: '1.00', currencyCode: 'EUR' },
              },
              merchandise: {},
            },
          ],
        },
      }),
    );
    expect(mapped.lines).toEqual([]);
    expect(isProductVariantMerchandise({})).toBe(false);
  });

  it('throws Shopify userErrors from cart mutations', () => {
    expect(() =>
      unwrapCartMutation(
        { cart: null, userErrors: [{ message: 'Variant is not available' }] },
        'fallback',
      ),
    ).toThrow(/Variant is not available/);
  });

  it('identifies Shopify GIDs and legacy mock cart lines', () => {
    expect(isShopifyGid('gid://shopify/ProductVariant/1', 'ProductVariant')).toBe(true);
    expect(isShopifyGid('bil-klassisk-rod', 'ProductVariant')).toBe(false);
    expect(
      isLegacyCartLine({
        productId: 'bil-klassisk',
        variantId: 'bil-klassisk-rod',
      }),
    ).toBe(true);
    expect(
      isLegacyCartLine({
        productId: 'gid://shopify/Product/1',
        variantId: 'gid://shopify/ProductVariant/1',
      }),
    ).toBe(false);
  });

  it('detects stale cart errors without matching variant or line errors', () => {
    expect(isStaleCartError(new Error('The specified cart does not exist'))).toBe(
      true,
    );
    expect(isStaleCartError(new Error('Cart not found'))).toBe(true);
    expect(isStaleCartError(new Error('Invalid cart id'))).toBe(true);
    expect(isStaleCartError(new Error('Network down'))).toBe(false);
    expect(isStaleCartError(new Error('The variant is not available'))).toBe(
      false,
    );
    expect(isStaleCartError(new Error('Variant not found'))).toBe(false);
    expect(isStaleCartError(new Error('Invalid cart line'))).toBe(false);
  });

  it('accepts only https checkout URLs without credentials', () => {
    expect(isSafeCheckoutUrl('https://example.myshopify.com/cart/c/abc123')).toBe(
      true,
    );
    expect(isSafeCheckoutUrl('https://www.shoplulu.eu/cart/c/abc123')).toBe(true);
    expect(isSafeCheckoutUrl('http://localhost/checkout')).toBe(false);
    expect(isSafeCheckoutUrl('http://example.myshopify.com/cart/c/abc123')).toBe(
      false,
    );
    expect(isSafeCheckoutUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeCheckoutUrl('data:text/html,hi')).toBe(false);
    expect(isSafeCheckoutUrl('/cart/c/abc123')).toBe(false);
    expect(isSafeCheckoutUrl('https://user:pass@example.myshopify.com/cart/c/x')).toBe(
      false,
    );
    expect(isSafeCheckoutUrl('')).toBe(false);
  });
});

describe('Shopify cart API client', () => {
  it('creates a cart and returns the mapped checkout URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ data: { cartCreate: { cart: cartPayload(), userErrors: [] } } })),
    );

    const cart = await createShopifyCart(
      [{ merchandiseId: 'gid://shopify/ProductVariant/99', quantity: 1 }],
      config,
    );
    expect(cart.checkoutUrl).toBe('https://example.myshopify.com/cart/c/abc123');
  });

  it('rehydrates a cart by id and returns null for expired carts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ data: { cart: null } })),
    );
    await expect(
      fetchShopifyCart('gid://shopify/Cart/missing', config),
    ).resolves.toBeNull();
  });

  it('does not send mock variant IDs as merchandiseId', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        query: string;
        variables: { input?: { lines?: Array<{ merchandiseId: string }> } };
      };
      expect(body.query).toContain('cartCreate');
      expect(body.variables.input?.lines?.[0]?.merchandiseId).toMatch(
        /^gid:\/\/shopify\/ProductVariant\//,
      );
      return jsonResponse({ data: { cartCreate: { cart: cartPayload(), userErrors: [] } } });
    });
    vi.stubGlobal('fetch', fetchMock);

    await addShopifyCartLines(null, [
      { merchandiseId: 'gid://shopify/ProductVariant/99', quantity: 1 },
    ], config);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('prevents duplicate cart creation during parallel ensure calls', async () => {
    let creates = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        creates += 1;
        await new Promise((resolve) => setTimeout(resolve, 25));
        return jsonResponse({
          data: { cartCreate: { cart: cartPayload(), userErrors: [] } },
        });
      }),
    );

    const [first, second] = await Promise.all([
      ensureShopifyCart(null, [], config),
      ensureShopifyCart(null, [], config),
    ]);
    expect(first.cartId).toBe(second.cartId);
    expect(creates).toBe(1);
  });

  it('surfaces GraphQL errors from the Storefront API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ errors: [{ message: 'Access denied for cartCreate field' }] }),
      ),
    );
    await expect(createShopifyCart([], config)).rejects.toBeInstanceOf(
      ShopifyStorefrontError,
    );
  });

  it('surfaces HTTP and network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ errors: [{ message: 'Unavailable' }] }, 500)),
    );
    await expect(createShopifyCart([], config)).rejects.toThrow(/HTTP 500/);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    await expect(createShopifyCart([], config)).rejects.toThrow(/Kunne ikke forbinde/);
  });

  it('recreates the cart when adding to a stale cart id', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { query: string };
      if (body.query.includes('cartLinesAdd')) {
        return jsonResponse({
          data: {
            cartLinesAdd: {
              cart: null,
              userErrors: [{ message: 'The specified cart does not exist.' }],
            },
          },
        });
      }
      return jsonResponse({
        data: { cartCreate: { cart: cartPayload(), userErrors: [] } },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const cart = await addShopifyCartLines(
      'gid://shopify/Cart/expired',
      [{ merchandiseId: 'gid://shopify/ProductVariant/99', quantity: 1 }],
      config,
    );
    expect(cart.cartId).toBe('gid://shopify/Cart/1');
  });

  it('does not recreate the cart when the variant is unavailable', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { query: string };
      expect(body.query).not.toContain('cartCreate');
      return jsonResponse({
        data: {
          cartLinesAdd: {
            cart: null,
            userErrors: [{ message: 'The variant is not available' }],
          },
        },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      addShopifyCartLines(
        'gid://shopify/Cart/1',
        [{ merchandiseId: 'gid://shopify/ProductVariant/99', quantity: 1 }],
        config,
      ),
    ).rejects.toThrow(/variant is not available/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('query documents', () => {
  it('requests checkoutUrl from the Cart API', () => {
    expect(CART_QUERY).toContain('checkoutUrl');
    expect(CART_CREATE_MUTATION).toContain('cartCreate');
  });
});
