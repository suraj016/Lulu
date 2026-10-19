import { configureStore } from '@reduxjs/toolkit';
import {
  cartReducer,
  loadCartState,
  persistCartState,
} from '../features/cart/cartSlice.ts';
import {
  loadWishlistState,
  persistWishlistState,
  wishlistReducer,
} from '../features/wishlist/wishlistSlice.ts';
import { uiReducer } from '../features/ui/uiSlice.ts';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
  preloadedState: {
    cart: loadCartState(),
    wishlist: loadWishlistState(),
  },
});

store.subscribe(() => {
  const snapshot = store.getState();
  persistCartState(snapshot.cart);
  persistWishlistState(snapshot.wishlist);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
