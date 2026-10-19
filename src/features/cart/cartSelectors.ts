import { createSelector } from '@reduxjs/toolkit';
import { getProductById } from '../../services/productService.ts';
import type { Product, ProductVariant } from '../../types/product.ts';
import {
  clampQuantity,
  isVariantPurchasable,
} from '../../utils/inventory.ts';
import { lineTotal, resolvePrice } from '../../utils/pricing.ts';
import type { RootState } from '../../app/store.ts';
import type { CartLine } from './cartSlice.ts';

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
  const price = product ? resolvePrice(product, variant) : { amount: 0 };
  const purchasable = Boolean(
    product && !missing && isVariantPurchasable(product, variant),
  );
  const maxQuantity = product
    ? clampQuantity(99, variant?.inventory ?? product.inventory) === 0
      ? 0
      : Math.max(
          clampQuantity(line.quantity, variant?.inventory ?? product.inventory),
          1,
        )
    : 0;

  return {
    line,
    product,
    variant,
    missing,
    purchasable,
    unitAmount: price.amount,
    lineAmount: lineTotal(price.amount, line.quantity),
    maxQuantity:
      product && variant
        ? Math.max(
            0,
            variant.inventory.trackQuantity
              ? variant.inventory.availableQuantity
              : 99,
          )
        : maxQuantity,
  };
}

export const selectCartView = createSelector([selectCartLines], (lines) => {
  const views = lines.map(resolveCartLine);
  const available = views.filter((view) => !view.missing);
  const subtotal = available.reduce((total, view) => total + view.lineAmount, 0);
  const hasUnavailable = views.some((view) => view.missing || !view.purchasable);

  return {
    lines: views,
    subtotal,
    hasUnavailable,
    isEmpty: views.length === 0,
  };
});
