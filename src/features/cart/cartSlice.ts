import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { readStorage, writeStorage } from '../../services/storageService.ts';

export type CartLine = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
};

const STORAGE_KEY = 'cart';
const STORAGE_VERSION = 1;

export function cartLineId(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

export function loadCartState(): CartState {
  const stored = readStorage<CartState>(STORAGE_KEY, STORAGE_VERSION);
  if (!stored || !Array.isArray(stored.lines)) {
    return { lines: [] };
  }
  const lines = stored.lines.filter(
    (line) =>
      typeof line?.id === 'string' &&
      typeof line.productId === 'string' &&
      typeof line.variantId === 'string' &&
      Number.isInteger(line.quantity) &&
      line.quantity > 0,
  );
  return { lines };
}

export function persistCartState(state: CartState): void {
  writeStorage(STORAGE_KEY, STORAGE_VERSION, { lines: state.lines });
}

const initialState: CartState = { lines: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartState>) {
      state.lines = action.payload.lines;
    },
    addItem(
      state,
      action: PayloadAction<{
        productId: string;
        variantId: string;
        quantity: number;
      }>,
    ) {
      const quantity = Math.floor(action.payload.quantity);
      if (quantity < 1) {
        return;
      }
      const id = cartLineId(action.payload.productId, action.payload.variantId);
      const existing = state.lines.find((line) => line.id === id);
      if (existing) {
        existing.quantity += quantity;
        return;
      }
      state.lines.push({
        id,
        productId: action.payload.productId,
        variantId: action.payload.variantId,
        quantity,
      });
    },
    updateQuantity(
      state,
      action: PayloadAction<{ lineId: string; quantity: number }>,
    ) {
      const line = state.lines.find((item) => item.id === action.payload.lineId);
      if (!line) {
        return;
      }
      const quantity = Math.floor(action.payload.quantity);
      if (quantity < 1) {
        state.lines = state.lines.filter((item) => item.id !== line.id);
        return;
      }
      line.quantity = quantity;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.id !== action.payload);
    },
    clearCart(state) {
      state.lines = [];
    },
  },
});

export const { hydrateCart, addItem, updateQuantity, removeItem, clearCart } =
  cartSlice.actions;

export const cartReducer = cartSlice.reducer;
