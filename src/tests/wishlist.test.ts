import { describe, expect, it, vi } from 'vitest';
import { selectWishlistProducts } from '../features/wishlist/wishlistSelectors.ts';
import {
  addToWishlist,
  loadWishlistState,
  persistWishlistState,
  toggleWishlist,
  wishlistReducer,
  type WishlistState,
} from '../features/wishlist/wishlistSlice.ts';
import * as storage from '../services/storageService.ts';

describe('wishlist', () => {
  it('toggles a product on and off', () => {
    const empty: WishlistState = { items: [] };
    const added = wishlistReducer(empty, toggleWishlist('vase-twist'));
    expect(added.items.map((item) => item.productId)).toEqual(['vase-twist']);
    const removed = wishlistReducer(added, toggleWishlist('vase-twist'));
    expect(removed.items).toEqual([]);
  });

  it('does not add the same product twice', () => {
    const empty: WishlistState = { items: [] };
    const once = wishlistReducer(empty, addToWishlist('gid://shopify/Product/1'));
    const twice = wishlistReducer(once, addToWishlist('gid://shopify/Product/1'));
    expect(twice.items).toHaveLength(1);
  });

  it('drops legacy mock product ids when hydrating persisted wishlists', () => {
    vi.spyOn(storage, 'readStorage').mockReturnValue({
      items: [
        { productId: 'bil-klassisk' },
        { productId: 'gid://shopify/Product/1' },
        { productId: '' },
      ],
    });
    expect(loadWishlistState().items).toEqual([
      { productId: 'gid://shopify/Product/1' },
    ]);
    vi.restoreAllMocks();
  });

  it('persists only wishlist product ids', () => {
    const write = vi.spyOn(storage, 'writeStorage').mockImplementation(() => undefined);
    persistWishlistState({
      items: [{ productId: 'gid://shopify/Product/1' }],
    });
    expect(write).toHaveBeenCalledWith('wishlist', 1, {
      items: [{ productId: 'gid://shopify/Product/1' }],
    });
    write.mockRestore();
  });

  it('omits wishlist ids that are not in the current catalog', () => {
    const products = selectWishlistProducts({
      wishlist: {
        items: [{ productId: 'bil-klassisk' }, { productId: 'missing-product' }],
      },
    } as never);
    expect(products.map((item) => item.id)).toEqual(['bil-klassisk']);
  });
});
