import { Link } from 'react-router-dom';
import { messages } from '../../data/messages.ts';
import type { CartLineView } from '../../features/cart/cartSelectors.ts';
import { removeItem, updateQuantity } from '../../features/cart/cartSlice.ts';
import { useAppDispatch } from '../../hooks/store.ts';
import { formatMoney } from '../../utils/currency.ts';
import { QuantitySelector } from '../ui/QuantitySelector.tsx';
import { SafeImage } from '../ui/SafeImage.tsx';
import styles from './CartItem.module.css';

export function CartItem({ view }: { view: CartLineView }) {
  const dispatch = useAppDispatch();
  const { line, product, variant, missing, purchasable } = view;
  const image = product?.images[0];

  if (missing || !product) {
    return (
      <article className={styles.item}>
        <SafeImage src="/placeholders/products/fallback.svg" alt="" />
        <div>
          <p>{messages.imageMissing}</p>
          <button type="button" onClick={() => dispatch(removeItem(line.id))}>
            {messages.actions.remove}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.item}>
      <SafeImage
        src={image?.src ?? '/placeholders/products/fallback.svg'}
        alt={image?.alt ?? product.name}
        width={100}
        height={100}
      />
      <div className={styles.meta}>
        <div className={styles.top}>
          <Link className={styles.name} to={`/product/${product.slug}`}>
            {product.name}
          </Link>
          <button type="button" onClick={() => dispatch(removeItem(line.id))}>
            {messages.actions.remove}
          </button>
        </div>
        <p>{variant?.label}</p>
        <p>{formatMoney(view.unitAmount, product.currency)}</p>
        {!purchasable ? (
          <p className={styles.warning}>{messages.product.outOfStock}</p>
        ) : null}
        <div className={styles.controls}>
          <QuantitySelector
            value={line.quantity}
            max={Math.max(1, view.maxQuantity)}
            onChange={(quantity) =>
              dispatch(updateQuantity({ lineId: line.id, quantity }))
            }
          />
          <strong>{formatMoney(view.lineAmount, product.currency)}</strong>
        </div>
      </div>
    </article>
  );
}
