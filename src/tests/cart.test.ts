import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CurrencyCode,
  ProductStatus,
  ProductType,
  type Product,
} from '../types/product.ts';
import { resolveCartLine, selectCartView } from '../features/cart/cartSelectors.ts';
import {
  addItem,
  beginCheckout,
  cartReducer,
  emptyCart,
  loadCartState,
  persistCartState,
  rehydrateCart,
  removeItem,
  updateQuantity,
  type CartLine,
  type CartState,
} from '../features/cart/cartSlice.ts';
import * as productService from '../services/productService.ts';
import * as cartService from '../services/shopifyCartService.ts';
import { ShopifyStorefrontError } from '../services/shopifyStorefront.ts';
import * as storage from '../services/storageService.ts';

vi.mock('../services/shopifyCartService.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/shopifyCartService.ts')>();
  return {
    ...actual,
    addShopifyCartLines: vi.fn(),
    fetchShopifyCart: vi.fn(),
    updateShopifyCartLines: vi.fn(),
    removeShopifyCartLines: vi.fn(),
    ensureShopifyCart: vi.fn(),
  };
});

const mappedCart = {
  cartId: 'gid://shopify/Cart/1',
  checkoutUrl: 'https://example.myshopify.com/cart/c/abc123',
  totalQuantity: 2,
  subtotalAmount: 2998,
  totalAmount: 2998,
  currency: CurrencyCode.Eur,
  lines: [
    {
      id: 'gid://shopify/CartLine/11',
      productId: 'gid://shopify/Product/5',
      variantId: 'gid://shopify/ProductVariant/99',
      quantity: 2,
      unitAmount: 1499,
      lineAmount: 2998,
      currency: CurrencyCode.Eur,
      merchandiseAvailable: true,
    },
  ],
};

function makeStore(preloaded: CartState = { ...emptyCart, status: 'ready' }) {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: preloaded },
  });
}

function catalogProduct(available: boolean): Product {
  return {
    id: 'gid://shopify/Product/5',
    slug: 'pink-socks',
    name: 'Pink socks',
    shortDescription: '',
    description: '',
    categoryId: 'socks',
    collectionIds: [],
    productType: ProductType.Socks,
    status: ProductStatus.Active,
    priceAmount: 1499,
    currency: CurrencyCode.Eur,
    images: [],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/99',
        sku: 'SKU-99',
        label: 'Default',
        imageIds: [],
        inventory: {
          trackQuantity: true,
          availableQuantity: available ? 8 : 0,
          allowBackorder: false,
        },
        isAvailable: available,
      },
    ],
    materials: [],
    colors: [],
    tags: [],
    isNew: false,
    isFeatured: false,
    isBestSeller: false,
    inventory: {
      trackQuantity: true,
      availableQuantity: available ? 8 : 0,
      allowBackorder: false,
    },
    specifications: [],
    details: [],
    materialSafety: [],
    deliveryInformation: [],
    complementaryProductIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function cartWithLines(overrides: Partial<CartState> = {}): CartState {
  return {
    ...emptyCart,
    cartId: 'gid://shopify/Cart/1',
    checkoutUrl: mappedCart.checkoutUrl,
    lines: mappedCart.lines,
    subtotalAmount: mappedCart.subtotalAmount,
    totalAmount: mappedCart.totalAmount,
    currency: mappedCart.currency,
    status: 'ready',
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(cartService.addShopifyCartLines).mockReset();
  vi.mocked(cartService.fetchShopifyCart).mockReset();
  vi.mocked(cartService.updateShopifyCartLines).mockReset();
  vi.mocked(cartService.removeShopifyCartLines).mockReset();
});

describe('cart thunks', () => {
  it('creates a Shopify cart when adding the first line', async () => {
    vi.mocked(cartService.addShopifyCartLines).mockResolvedValue(mappedCart);
    const store = makeStore();

    await store
      .dispatch(
        addItem({
          productId: 'gid://shopify/Product/5',
          variantId: 'gid://shopify/ProductVariant/99',
          quantity: 2,
        }),
      )
      .unwrap();

    expect(cartService.addShopifyCartLines).toHaveBeenCalledWith(null, [
      { merchandiseId: 'gid://shopify/ProductVariant/99', quantity: 2 },
    ]);
    expect(store.getState().cart.cartId).toBe('gid://shopify/Cart/1');
    expect(store.getState().cart.lines).toHaveLength(1);
    expect(store.getState().cart.subtotalAmount).toBe(2998);
    expect(store.getState().cart.currency).toBe(CurrencyCode.Eur);
  });

  it('rejects mock variant IDs instead of sending them to Shopify', async () => {
    const store = makeStore();
    const result = await store.dispatch(
      addItem({
        productId: 'bil-klassisk',
        variantId: 'bil-klassisk-rod',
        quantity: 1,
      }),
    );
    expect(result.meta.requestStatus).toBe('rejected');
    expect(cartService.addShopifyCartLines).not.toHaveBeenCalled();
  });

  it('updates and removes Shopify cart lines by line id', async () => {
    vi.mocked(cartService.updateShopifyCartLines).mockResolvedValue({
      ...mappedCart,
      lines: [{ ...mappedCart.lines[0]!, quantity: 4, lineAmount: 5996 }],
      subtotalAmount: 5996,
      totalAmount: 5996,
    });
    vi.mocked(cartService.removeShopifyCartLines).mockResolvedValue({
      ...mappedCart,
      lines: [],
      totalQuantity: 0,
      subtotalAmount: 0,
      totalAmount: 0,
    });

    const store = makeStore({
      ...emptyCart,
      cartId: 'gid://shopify/Cart/1',
      checkoutUrl: mappedCart.checkoutUrl,
      lines: mappedCart.lines,
      status: 'ready',
    });

    await store
      .dispatch(
        updateQuantity({ lineId: 'gid://shopify/CartLine/11', quantity: 4 }),
      )
      .unwrap();
    expect(cartService.updateShopifyCartLines).toHaveBeenCalledWith(
      'gid://shopify/Cart/1',
      [{ id: 'gid://shopify/CartLine/11', quantity: 4 }],
    );

    await store.dispatch(removeItem('gid://shopify/CartLine/11')).unwrap();
    expect(cartService.removeShopifyCartLines).toHaveBeenCalledWith(
      'gid://shopify/Cart/1',
      ['gid://shopify/CartLine/11'],
    );
    expect(store.getState().cart.lines).toEqual([]);
  });

  it('rehydrates from Shopify and clears expired cart ids', async () => {
    vi.mocked(cartService.fetchShopifyCart).mockResolvedValueOnce(mappedCart);
    const store = makeStore({
      ...emptyCart,
      cartId: 'gid://shopify/Cart/1',
    });
    await store.dispatch(rehydrateCart()).unwrap();
    expect(store.getState().cart.lines[0]?.id).toBe('gid://shopify/CartLine/11');

    vi.mocked(cartService.fetchShopifyCart).mockResolvedValueOnce(null);
    await store.dispatch(rehydrateCart()).unwrap();
    expect(store.getState().cart.cartId).toBeNull();
    expect(store.getState().cart.lines).toEqual([]);
  });

  it('returns the Shopify checkout URL after syncing the cart', async () => {
    vi.mocked(cartService.fetchShopifyCart).mockResolvedValue(mappedCart);
    const store = makeStore(cartWithLines());
    const result = await store.dispatch(beginCheckout()).unwrap();
    expect(result.checkoutUrl).toBe(
      'https://example.myshopify.com/cart/c/abc123',
    );
  });

  it('adds the same variant again through Shopify instead of merging locally', async () => {
    vi.mocked(cartService.addShopifyCartLines)
      .mockResolvedValueOnce(mappedCart)
      .mockResolvedValueOnce({
        ...mappedCart,
        totalQuantity: 3,
        subtotalAmount: 4497,
        totalAmount: 4497,
        lines: [{ ...mappedCart.lines[0]!, quantity: 3, lineAmount: 4497 }],
      });
    const store = makeStore();

    await store
      .dispatch(
        addItem({
          productId: 'gid://shopify/Product/5',
          variantId: 'gid://shopify/ProductVariant/99',
          quantity: 2,
        }),
      )
      .unwrap();
    await store
      .dispatch(
        addItem({
          productId: 'gid://shopify/Product/5',
          variantId: 'gid://shopify/ProductVariant/99',
          quantity: 1,
        }),
      )
      .unwrap();

    expect(cartService.addShopifyCartLines).toHaveBeenNthCalledWith(
      2,
      'gid://shopify/Cart/1',
      [{ merchandiseId: 'gid://shopify/ProductVariant/99', quantity: 1 }],
    );
    expect(store.getState().cart.lines[0]?.quantity).toBe(3);
    expect(store.getState().cart.subtotalAmount).toBe(4497);
  });

  it('rejects out-of-stock catalog variants before calling Shopify', async () => {
    const spy = vi
      .spyOn(productService, 'getProductById')
      .mockReturnValue(catalogProduct(false));
    const store = makeStore();
    const result = await store.dispatch(
      addItem({
        productId: 'gid://shopify/Product/5',
        variantId: 'gid://shopify/ProductVariant/99',
        quantity: 1,
      }),
    );

    expect(result.meta.requestStatus).toBe('rejected');
    expect(cartService.addShopifyCartLines).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('treats quantity below 1 as a remove and rejects non-finite quantities', async () => {
    vi.mocked(cartService.removeShopifyCartLines).mockResolvedValue({
      ...mappedCart,
      lines: [],
      totalQuantity: 0,
      subtotalAmount: 0,
      totalAmount: 0,
    });
    const store = makeStore(cartWithLines());

    await store
      .dispatch(updateQuantity({ lineId: 'gid://shopify/CartLine/11', quantity: 0 }))
      .unwrap();
    expect(cartService.removeShopifyCartLines).toHaveBeenCalledWith(
      'gid://shopify/Cart/1',
      ['gid://shopify/CartLine/11'],
    );
    expect(cartService.updateShopifyCartLines).not.toHaveBeenCalled();

    const invalid = await store.dispatch(
      updateQuantity({ lineId: 'gid://shopify/CartLine/11', quantity: Number.NaN }),
    );
    expect(invalid.meta.requestStatus).toBe('rejected');
    expect(cartService.updateShopifyCartLines).not.toHaveBeenCalled();
  });

  it('keeps existing lines when quantity or remove mutations fail', async () => {
    vi.mocked(cartService.updateShopifyCartLines).mockRejectedValue(
      new ShopifyStorefrontError('Lageret er opbrugt.'),
    );
    vi.mocked(cartService.removeShopifyCartLines).mockRejectedValue(
      new ShopifyStorefrontError('Varen kunne ikke fjernes.'),
    );
    const store = makeStore(cartWithLines());

    const updated = await store.dispatch(
      updateQuantity({ lineId: 'gid://shopify/CartLine/11', quantity: 9 }),
    );
    expect(updated.meta.requestStatus).toBe('rejected');
    expect(store.getState().cart.lines[0]?.quantity).toBe(2);
    expect(store.getState().cart.status).toBe('error');

    const removed = await store.dispatch(removeItem('gid://shopify/CartLine/11'));
    expect(removed.meta.requestStatus).toBe('rejected');
    expect(store.getState().cart.lines).toHaveLength(1);
  });

  it('queues overlapping cart mutations so they run one at a time', async () => {
    const order: string[] = [];
    vi.mocked(cartService.updateShopifyCartLines).mockImplementation(
      async (_cartId, lines) => {
        const quantity = lines[0]?.quantity ?? 0;
        order.push(`start-${quantity}`);
        await new Promise((resolve) => setTimeout(resolve, 20));
        order.push(`end-${quantity}`);
        return {
          ...mappedCart,
          lines: [{ ...mappedCart.lines[0]!, quantity, lineAmount: 1499 * quantity }],
          subtotalAmount: 1499 * quantity,
          totalAmount: 1499 * quantity,
        };
      },
    );
    const store = makeStore(cartWithLines());

    await Promise.all([
      store.dispatch(
        updateQuantity({ lineId: 'gid://shopify/CartLine/11', quantity: 2 }),
      ),
      store.dispatch(
        updateQuantity({ lineId: 'gid://shopify/CartLine/11', quantity: 3 }),
      ),
    ]);

    expect(order).toEqual(['start-2', 'end-2', 'start-3', 'end-3']);
  });

  it('keeps the persisted cart id when rehydration fails over the network', async () => {
    vi.mocked(cartService.fetchShopifyCart).mockRejectedValue(
      new ShopifyStorefrontError(
        'Kunne ikke forbinde til Shopify Storefront API. Tjek netværket og butiksdomænet.',
      ),
    );
    const store = makeStore({
      ...emptyCart,
      cartId: 'gid://shopify/Cart/1',
    });

    const result = await store.dispatch(rehydrateCart());
    expect(result.meta.requestStatus).toBe('rejected');
    expect(store.getState().cart.cartId).toBe('gid://shopify/Cart/1');
    expect(store.getState().cart.status).toBe('error');
    expect(store.getState().cart.error).toMatch(/Kunne ikke forbinde/);
  });

  it('clears an expired cart id reported as a stale Shopify cart', async () => {
    vi.mocked(cartService.fetchShopifyCart).mockRejectedValue(
      new ShopifyStorefrontError('The specified cart does not exist.'),
    );
    const store = makeStore({
      ...emptyCart,
      cartId: 'gid://shopify/Cart/expired',
    });

    await store.dispatch(rehydrateCart()).unwrap();
    expect(store.getState().cart.cartId).toBeNull();
    expect(store.getState().cart.lines).toEqual([]);
    expect(store.getState().cart.status).toBe('ready');
  });

  it('prevents empty-cart and unavailable-item checkout', async () => {
    const emptyStore = makeStore();
    const emptyResult = await emptyStore.dispatch(beginCheckout());
    expect(emptyResult.meta.requestStatus).toBe('rejected');
    expect(cartService.fetchShopifyCart).not.toHaveBeenCalled();

    vi.mocked(cartService.fetchShopifyCart).mockResolvedValueOnce({
      ...mappedCart,
      lines: [],
      totalQuantity: 0,
    });
    const syncedEmpty = makeStore(cartWithLines());
    const syncedEmptyResult = await syncedEmpty.dispatch(beginCheckout());
    expect(syncedEmptyResult.meta.requestStatus).toBe('rejected');

    vi.mocked(cartService.fetchShopifyCart).mockResolvedValueOnce({
      ...mappedCart,
      lines: [{ ...mappedCart.lines[0]!, merchandiseAvailable: false }],
    });
    const unavailable = makeStore(cartWithLines());
    const unavailableResult = await unavailable.dispatch(beginCheckout());
    expect(unavailableResult.meta.requestStatus).toBe('rejected');
    expect(unavailable.getState().cart.lines[0]?.merchandiseAvailable).toBe(true);
  });

  it('rejects an http checkout URL', async () => {
    vi.mocked(cartService.fetchShopifyCart).mockResolvedValue({
      ...mappedCart,
      checkoutUrl: 'http://example.myshopify.com/cart/c/abc123',
    });
    const store = makeStore(cartWithLines());
    const result = await store.dispatch(beginCheckout());
    expect(result.meta.requestStatus).toBe('rejected');
  });

  it('rejects a checkout URL that is not http(s)', async () => {
    vi.mocked(cartService.fetchShopifyCart).mockResolvedValue({
      ...mappedCart,
      checkoutUrl: 'javascript:alert(1)',
    });
    const store = makeStore(cartWithLines());
    const result = await store.dispatch(beginCheckout());
    expect(result.meta.requestStatus).toBe('rejected');
  });
});

describe('cart view pricing', () => {
  it('uses Shopify line amounts rather than catalog mock prices', () => {
    const line: CartLine = {
      id: 'gid://shopify/CartLine/11',
      productId: 'gid://shopify/Product/5',
      variantId: 'gid://shopify/ProductVariant/99',
      quantity: 2,
      unitAmount: 1499,
      lineAmount: 2998,
      currency: CurrencyCode.Eur,
      merchandiseAvailable: true,
    };
    const view = resolveCartLine(line);
    expect(view.unitAmount).toBe(1499);
    expect(view.lineAmount).toBe(2998);
    expect(view.missing).toBe(true);
  });

  it('blocks checkout from Shopify availability, not catalog presence', () => {
    const availableMissing = selectCartView({
      cart: cartWithLines({
        lines: [
          {
            ...mappedCart.lines[0]!,
            productId: 'gid://shopify/Product/missing',
            merchandiseAvailable: true,
          },
        ],
      }),
    } as never);
    expect(availableMissing.lines[0]?.missing).toBe(true);
    expect(availableMissing.hasUnavailable).toBe(false);

    const unavailable = selectCartView({
      cart: cartWithLines({
        lines: [{ ...mappedCart.lines[0]!, merchandiseAvailable: false }],
      }),
    } as never);
    expect(unavailable.hasUnavailable).toBe(true);
  });
});

describe('legacy cart migration', () => {
  it('does not restore mock product lines from version 1 storage', () => {
    vi.spyOn(storage, 'readStorage').mockReturnValue(null);
    vi.spyOn(storage, 'readStorageEnvelope').mockReturnValue({
      version: 1,
      savedAt: '2026-01-01T00:00:00.000Z',
      data: {
        lines: [
          {
            id: 'bil-klassisk:bil-klassisk-rod',
            productId: 'bil-klassisk',
            variantId: 'bil-klassisk-rod',
            quantity: 2,
          },
        ],
      },
    });

    const state = loadCartState();
    expect(state.lines).toEqual([]);
    expect(state.cartId).toBeNull();
    expect(state.migratedFromLegacy).toBe(true);
    vi.restoreAllMocks();
  });

  it('persists only the Shopify cart id', () => {
    const write = vi.spyOn(storage, 'writeStorage').mockImplementation(() => undefined);
    persistCartState({
      ...emptyCart,
      cartId: 'gid://shopify/Cart/1',
    });
    expect(write).toHaveBeenCalledWith('cart', 2, {
      cartId: 'gid://shopify/Cart/1',
    });
    write.mockRestore();
  });
});

describe('cart reducer', () => {
  it('starts empty without local mock lines', () => {
    expect(cartReducer(undefined, { type: 'unknown' }).lines).toEqual([]);
  });
});
