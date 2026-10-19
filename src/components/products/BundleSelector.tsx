import { useState } from 'react';
import { messages } from '../../data/messages.ts';
import { addItem } from '../../features/cart/cartSlice.ts';
import { openCart, showToast } from '../../features/ui/uiSlice.ts';
import { useAppDispatch } from '../../hooks/store.ts';
import { getDefaultVariant } from '../../services/productService.ts';
import type { Product } from '../../types/product.ts';
import { formatMoney } from '../../utils/currency.ts';
import { resolvePrice, sumAmounts } from '../../utils/pricing.ts';
import { Button } from '../ui/Button.tsx';
import { SafeImage } from '../ui/SafeImage.tsx';
import styles from './BundleSelector.module.css';

export function BundleSelector({
  product,
  complementary,
}: {
  product: Product;
  complementary: Product[];
}) {
  const dispatch = useAppDispatch();
  const items = [product, ...complementary];
  const [selected, setSelected] = useState<string[]>(() =>
    [product.id, ...complementary.map((item) => item.id)],
  );
  const selectedProducts = items.filter((item) => selected.includes(item.id));

  const total = sumAmounts(
    selectedProducts.map((item) => resolvePrice(item).amount),
  );

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const addSelected = () => {
    selectedProducts.forEach((item) => {
      const variant = getDefaultVariant(item);
      if (!variant) {
        return;
      }
      dispatch(
        addItem({
          productId: item.id,
          variantId: variant.id,
          quantity: 1,
        }),
      );
    });
    dispatch(
      showToast({
        message: messages.product.addedToCart,
        action: 'open-cart',
      }),
    );
    dispatch(openCart());
  };

  if (complementary.length === 0) {
    return null;
  }

  return (
    <section className={styles.wrap} aria-labelledby="bundle-title">
      <h2 id="bundle-title">{messages.product.boughtTogether}</h2>
      <div className={styles.items}>
        {items.map((item) => {
          const image = item.images[0];
          const price = resolvePrice(item);
          return (
            <label className={styles.item} key={item.id}>
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggle(item.id)}
              />
              <SafeImage
                src={image?.src ?? '/placeholders/products/fallback.svg'}
                alt={image?.alt ?? item.name}
                width={120}
                height={120}
              />
              <span>
                <strong>{item.name}</strong>
                <br />
                {formatMoney(price.amount, item.currency)}
              </span>
            </label>
          );
        })}
      </div>
      <div className={styles.total}>
        <p>
          {messages.product.combinedPrice}:{' '}
          <strong>{formatMoney(total)}</strong>
        </p>
        <Button onClick={addSelected} disabled={selectedProducts.length === 0}>
          {messages.actions.addSelected}
        </Button>
      </div>
    </section>
  );
}
