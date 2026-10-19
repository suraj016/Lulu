import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { readStorage, writeStorage } from '../../services/storageService.ts';

export type WishlistItem = {
  productId: string;
};

export type WishlistState = {
  items: WishlistItem[];
};

const STORAGE_KEY = 'wishlist';
const STORAGE_VERSION = 1;

export function loadWishlistState(): WishlistState {
  const stored = readStorage<WishlistState>(STORAGE_KEY, STORAGE_VERSION);
  if (!stored || !Array.isArray(stored.items)) {
    return { items: [] };
  }
  const items = stored.items.filter(
    (item) => typeof item?.productId === 'string' && item.productId.length > 0,
  );
  return { items };
}

export function persistWishlistState(state: WishlistState): void {
  writeStorage(STORAGE_KEY, STORAGE_VERSION, { items: state.items });
}

const initialState: WishlistState = { items: [] };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    hydrateWishlist(state, action: PayloadAction<WishlistState>) {
      state.items = action.payload.items;
    },
    addToWishlist(state, action: PayloadAction<string>) {
      if (state.items.some((item) => item.productId === action.payload)) {
        return;
      }
      state.items.push({ productId: action.payload });
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
    },
    toggleWishlist(state, action: PayloadAction<string>) {
      const exists = state.items.some(
        (item) => item.productId === action.payload,
      );
      if (exists) {
        state.items = state.items.filter(
          (item) => item.productId !== action.payload,
        );
        return;
      }
      state.items.push({ productId: action.payload });
    },
  },
});

export const {
  hydrateWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} = wishlistSlice.actions;

export const wishlistReducer = wishlistSlice.reducer;
