import { createSelector } from '@reduxjs/toolkit';
import { getProductById } from '../../services/productService.ts';
import type { Product, ProductVariant } from '../../types/product.ts';
import type { RootState } from '../../app/store.ts';
import type { CartLine, CartState } from './cartSlice.ts';

export type CartLineView = {
  line: CartLine;
  product?: Product;
  variant?: ProductVariant;
  missing: boolean;
  purchasable: boolean;
  unitAmount: number;
  lineAmount: number;
  maxQuantity: number;
};

export const selectCart = (state: RootState): CartState => state.cart;

export const selectCartLines = (state: RootState) => state.cart.lines;

export const selectCartItemQuantity = createSelector(
  [selectCartLines],
  (lines) => lines.reduce((total, line) => total + line.quantity, 0),
);

export const selectCartLineCount = createSelector(
  [selectCartLines],
  (lines) => lines.length,
);

export const selectCartIsEmpty = createSelector(
  [selectCartLines],
  (lines) => lines.length === 0,
);

export function resolveCartLine(line: CartLine): CartLineView {
  const product = getProductById(line.productId);
  const variant = product?.variants.find((item) => item.id === line.variantId);
  const missing = !product || (product.variants.length > 0 && !variant);
  const purchasable = line.merchandiseAvailable;
  const maxQuantity =
    product && variant
      ? Math.max(
          1,
          variant.inventory.trackQuantity
            ? Math.max(variant.inventory.availableQuantity, line.quantity)
            : 99,
        )
      : Math.max(1, line.quantity);

  return {
    line,
    product,
    variant,
    missing,
    purchasable,
    unitAmount: line.unitAmount,
    lineAmount: line.lineAmount,
    maxQuantity,
  };
}

export const selectCartView = createSelector([selectCart], (cart) => {
  const views = cart.lines.map(resolveCartLine);
  const hasUnavailable = views.some((view) => !view.purchasable);

  return {
    lines: views,
    subtotal: cart.subtotalAmount,
    total: cart.totalAmount,
    currency: cart.currency,
    hasUnavailable,
    isEmpty: views.length === 0,
    status: cart.status,
    error: cart.error,
    checkoutUrl: cart.checkoutUrl,
    cartId: cart.cartId,
    migratedFromLegacy: cart.migratedFromLegacy,
    busy: cart.status === 'loading',
  };
});
