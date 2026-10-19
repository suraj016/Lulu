import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store.ts';
import { getProductById } from '../../services/productService.ts';

export const selectWishlistItems = (state: RootState) => state.wishlist.items;

export const selectWishlistProductIds = createSelector(
  [selectWishlistItems],
  (items) => items.map((item) => item.productId),
);

export const selectIsWishlisted = (productId: string) =>
  createSelector([selectWishlistProductIds], (ids) => ids.includes(productId));

export const selectWishlistProducts = createSelector(
  [selectWishlistItems],
  (items) =>
    items
      .map((item) => getProductById(item.productId))
      .filter((product): product is NonNullable<typeof product> =>
        Boolean(product),
      ),
);
