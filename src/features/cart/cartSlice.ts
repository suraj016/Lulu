import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { CurrencyCode } from '../../types/product.ts';
import { getProductById } from '../../services/productService.ts';
import {
  addShopifyCartLines,
  fetchShopifyCart,
  isLegacyCartLine,
  isSafeCheckoutUrl,
  isShopifyGid,
  isStaleCartError,
  removeShopifyCartLines,
  updateShopifyCartLines,
  type MappedCart,
} from '../../services/shopifyCartService.ts';
import { ShopifyStorefrontError } from '../../services/shopifyStorefront.ts';
import {
  readStorage,
  readStorageEnvelope,
  writeStorage,
} from '../../services/storageService.ts';
import { isVariantPurchasable } from '../../utils/inventory.ts';

export type CartLine = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
  currency: CurrencyCode;
  merchandiseAvailable: boolean;
};

export type CartStatus = 'idle' | 'loading' | 'ready' | 'error';

export type CartState = {
  cartId: string | null;
  checkoutUrl: string | null;
  lines: CartLine[];
  subtotalAmount: number;
  totalAmount: number;
  currency: CurrencyCode;
  status: CartStatus;
  error: string | null;
  migratedFromLegacy: boolean;
};

type PersistedCartV2 = {
  cartId: string | null;
};

const STORAGE_KEY = 'cart';
const STORAGE_VERSION = 2;

const emptyCart: CartState = {
  cartId: null,
  checkoutUrl: null,
  lines: [],
  subtotalAmount: 0,
  totalAmount: 0,
  currency: CurrencyCode.Dkk,
  status: 'idle',
  error: null,
  migratedFromLegacy: false,
};

let mutationQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const next = mutationQueue.then(work, work);
  mutationQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function mappedToState(cart: MappedCart, migratedFromLegacy: boolean): CartState {
  return {
    cartId: cart.cartId,
    checkoutUrl: cart.checkoutUrl,
    lines: cart.lines,
    subtotalAmount: cart.subtotalAmount,
    totalAmount: cart.totalAmount,
    currency: cart.currency,
    status: 'ready',
    error: null,
    migratedFromLegacy,
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof ShopifyStorefrontError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Kurven kunne ikke opdateres.';
}

export function cartLineId(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

export function loadCartState(): CartState {
  const stored = readStorage<PersistedCartV2>(STORAGE_KEY, STORAGE_VERSION);
  if (stored?.cartId && isShopifyGid(stored.cartId, 'Cart')) {
    return { ...emptyCart, cartId: stored.cartId };
  }

  const envelope = readStorageEnvelope(STORAGE_KEY);
  const legacyData = envelope?.data as { lines?: Array<{ productId?: string; variantId?: string }> } | undefined;
  const hasLegacyLines =
    envelope?.version === 1 &&
    Array.isArray(legacyData?.lines) &&
    legacyData.lines.some((line) => isLegacyCartLine(line));

  return {
    ...emptyCart,
    migratedFromLegacy: Boolean(hasLegacyLines),
  };
}

export function persistCartState(state: CartState): void {
  writeStorage<PersistedCartV2>(STORAGE_KEY, STORAGE_VERSION, {
    cartId: state.cartId,
  });
}

function assertMerchandise(variantId: string, quantity: number): void {
  if (!isShopifyGid(variantId, 'ProductVariant')) {
    throw new ShopifyStorefrontError(
      'Varen kan ikke lægges i kurven, fordi variant-id ikke er et Shopify-id.',
    );
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ShopifyStorefrontError('Antallet skal være mindst 1.');
  }
}

type CartThunkConfig = {
  state: { cart: CartState };
  rejectValue: string;
};

export const rehydrateCart = createAsyncThunk<
  CartState,
  void,
  CartThunkConfig
>('cart/rehydrate', async (_void, { getState, rejectWithValue }) => {
  const current = getState().cart;
  if (!current.cartId) {
    return {
      ...emptyCart,
      migratedFromLegacy: current.migratedFromLegacy,
      status: 'ready',
    };
  }

  try {
    const cart = await fetchShopifyCart(current.cartId);
    if (!cart) {
      return {
        ...emptyCart,
        migratedFromLegacy: current.migratedFromLegacy,
        status: 'ready',
      };
    }
    return mappedToState(cart, current.migratedFromLegacy);
  } catch (error) {
    if (isStaleCartError(error)) {
      return {
        ...emptyCart,
        migratedFromLegacy: current.migratedFromLegacy,
        status: 'ready',
      };
    }
    return rejectWithValue(errorMessage(error));
  }
});

export const addItem = createAsyncThunk<
  CartState,
  { productId: string; variantId: string; quantity: number },
  CartThunkConfig
>('cart/addItem', async (input, { getState, rejectWithValue }) => {
  try {
    return await enqueue(async () => {
      const quantity = Math.floor(input.quantity);
      assertMerchandise(input.variantId, quantity);

      const product = getProductById(input.productId);
      const variant = product?.variants.find((item) => item.id === input.variantId);
      if (product && variant && !isVariantPurchasable(product, variant)) {
        throw new ShopifyStorefrontError('Denne variant er ikke tilgængelig.');
      }

      const cart = await addShopifyCartLines(getState().cart.cartId, [
        { merchandiseId: input.variantId, quantity },
      ]);
      return mappedToState(cart, getState().cart.migratedFromLegacy);
    });
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const updateQuantity = createAsyncThunk<
  CartState,
  { lineId: string; quantity: number },
  CartThunkConfig
>('cart/updateQuantity', async (input, { getState, rejectWithValue }) => {
  try {
    return await enqueue(async () => {
      const cartId = getState().cart.cartId;
      if (!cartId) {
        throw new ShopifyStorefrontError('Kurven er ikke oprettet i Shopify endnu.');
      }
      const quantity = Math.floor(input.quantity);
      if (!Number.isFinite(quantity)) {
        throw new ShopifyStorefrontError('Antallet skal være et gyldigt tal.');
      }
      const cart =
        quantity < 1
          ? await removeShopifyCartLines(cartId, [input.lineId])
          : await updateShopifyCartLines(cartId, [
              { id: input.lineId, quantity },
            ]);
      return mappedToState(cart, getState().cart.migratedFromLegacy);
    });
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const removeItem = createAsyncThunk<
  CartState,
  string,
  CartThunkConfig
>('cart/removeItem', async (lineId, { getState, rejectWithValue }) => {
  try {
    return await enqueue(async () => {
      const cartId = getState().cart.cartId;
      if (!cartId) {
        throw new ShopifyStorefrontError('Kurven er ikke oprettet i Shopify endnu.');
      }
      const cart = await removeShopifyCartLines(cartId, [lineId]);
      return mappedToState(cart, getState().cart.migratedFromLegacy);
    });
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const beginCheckout = createAsyncThunk<
  CartState,
  void,
  CartThunkConfig
>('cart/beginCheckout', async (_void, { getState, rejectWithValue }) => {
  try {
    return await enqueue(async () => {
      const current = getState().cart;
      if (!current.cartId) {
        throw new ShopifyStorefrontError('Kurven er tom og kan ikke sendes til kassen.');
      }
      const cart = await fetchShopifyCart(current.cartId);
      if (!cart) {
        throw new ShopifyStorefrontError(
          'Shopify-kurven er udløbet. Læg varerne i kurven igen.',
        );
      }
      if (cart.lines.length === 0) {
        throw new ShopifyStorefrontError('Kurven er tom og kan ikke sendes til kassen.');
      }
      if (cart.lines.some((line) => !line.merchandiseAvailable)) {
        throw new ShopifyStorefrontError(
          'Nogle varer er ikke på lager og kan ikke sendes til kassen.',
        );
      }
      if (!cart.checkoutUrl || !isSafeCheckoutUrl(cart.checkoutUrl)) {
        throw new ShopifyStorefrontError('Shopify returnerede ikke en gyldig kasse-adresse.');
      }
      return mappedToState(cart, current.migratedFromLegacy);
    });
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: emptyCart,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartState>) {
      Object.assign(state, action.payload);
    },
    clearCart(state) {
      Object.assign(state, emptyCart);
      state.status = 'ready';
    },
    clearCartError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: CartState) => {
      state.status = 'loading';
      state.error = null;
    };
    const fulfilled = (state: CartState, action: PayloadAction<CartState>) => {
      Object.assign(state, action.payload);
      state.status = 'ready';
      state.error = null;
    };
    const rejected = (
      state: CartState,
      action: { payload?: string; error: { message?: string } },
    ) => {
      state.status = 'error';
      state.error = action.payload ?? action.error.message ?? 'Kurven kunne ikke opdateres.';
    };

    builder
      .addCase(rehydrateCart.pending, pending)
      .addCase(rehydrateCart.fulfilled, fulfilled)
      .addCase(rehydrateCart.rejected, rejected)
      .addCase(addItem.pending, pending)
      .addCase(addItem.fulfilled, fulfilled)
      .addCase(addItem.rejected, rejected)
      .addCase(updateQuantity.pending, pending)
      .addCase(updateQuantity.fulfilled, fulfilled)
      .addCase(updateQuantity.rejected, rejected)
      .addCase(removeItem.pending, pending)
      .addCase(removeItem.fulfilled, fulfilled)
      .addCase(removeItem.rejected, rejected)
      .addCase(beginCheckout.pending, pending)
      .addCase(beginCheckout.fulfilled, fulfilled)
      .addCase(beginCheckout.rejected, rejected);
  },
});

export const { hydrateCart, clearCart, clearCartError } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
export { emptyCart };
