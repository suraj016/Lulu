import { describe, expect, it } from 'vitest';
import {
  toggleWishlist,
  wishlistReducer,
  type WishlistState,
} from '../features/wishlist/wishlistSlice.ts';

describe('wishlist', () => {
  it('toggles a product on and off', () => {
    const empty: WishlistState = { items: [] };
    const added = wishlistReducer(empty, toggleWishlist('vase-twist'));
    expect(added.items.map((item) => item.productId)).toEqual(['vase-twist']);
    const removed = wishlistReducer(added, toggleWishlist('vase-twist'));
    expect(removed.items).toEqual([]);
  });
});
