import { describe, expect, it } from 'vitest';
import {
  addItem,
  cartLineId,
  cartReducer,
  removeItem,
  updateQuantity,
  type CartState,
} from '../features/cart/cartSlice.ts';
import { resolveCartLine } from '../features/cart/cartSelectors.ts';

const empty: CartState = { lines: [] };

describe('cart', () => {
  it('merges identical product/variant lines', () => {
    const once = cartReducer(
      empty,
      addItem({ productId: 'bil-klassisk', variantId: 'bil-klassisk-rod', quantity: 1 }),
    );
    const twice = cartReducer(
      once,
      addItem({ productId: 'bil-klassisk', variantId: 'bil-klassisk-rod', quantity: 2 }),
    );
    expect(twice.lines).toHaveLength(1);
    expect(twice.lines[0]?.quantity).toBe(3);
    expect(twice.lines[0]?.id).toBe(
      cartLineId('bil-klassisk', 'bil-klassisk-rod'),
    );
  });

  it('updates and removes quantities', () => {
    const added = cartReducer(
      empty,
      addItem({ productId: 'pen-holder', variantId: 'pen-holder-sort', quantity: 2 }),
    );
    const updated = cartReducer(
      added,
      updateQuantity({ lineId: added.lines[0]!.id, quantity: 4 }),
    );
    expect(updated.lines[0]?.quantity).toBe(4);
    const removed = cartReducer(updated, removeItem(updated.lines[0]!.id));
    expect(removed.lines).toHaveLength(0);
  });

  it('resolves line totals from catalog prices, not stored prices', () => {
    const state = cartReducer(
      empty,
      addItem({ productId: 'bil-klassisk', variantId: 'bil-klassisk-rod', quantity: 2 }),
    );
    const view = resolveCartLine(state.lines[0]!);
    expect(view.unitAmount).toBe(14900);
    expect(view.lineAmount).toBe(29800);
    expect(view.missing).toBe(false);
  });
});
