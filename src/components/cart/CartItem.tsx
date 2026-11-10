import { Link } from 'react-router-dom';
import { messages } from '../../data/messages.ts';
import type { CartLineView } from '../../features/cart/cartSelectors.ts';
import { removeItem, updateQuantity } from '../../features/cart/cartSlice.ts';
import { showToast } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { formatMoney } from '../../utils/currency.ts';
import { QuantitySelector } from '../ui/QuantitySelector.tsx';
import { SafeImage } from '../ui/SafeImage.tsx';
import styles from './CartItem.module.css';

export function CartItem({ view }: { view: CartLineView }) {
  const dispatch = useAppDispatch();
  const busy = useAppSelector((state) => state.cart.status === 'loading');
  const { line, product, variant, missing, purchasable } = view;

  const changeQuantity = (quantity: number) => {
    void dispatch(updateQuantity({ lineId: line.id, quantity }))
      .unwrap()
      .catch(() => {
        dispatch(showToast({ message: messages.cart.updateFailed }));
      });
  };

  const remove = () => {
    void dispatch(removeItem(line.id))
      .unwrap()
      .catch(() => {
        dispatch(showToast({ message: messages.cart.updateFailed }));
      });
  };

  if (missing || !product) {
    return (
      <article className={styles.item}>
        <SafeImage src="/placeholders/products/fallback.svg" alt="" width={80} height={80} />
        <div>
          <p>{messages.imageMissing}</p>
          <button type="button" className={styles.remove} onClick={remove} disabled={busy}>
            {messages.actions.remove}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.item}>
      <SafeImage
        src={imageSrc(view)}
        alt={product.images[0]?.alt ?? product.name}
        width={100}
        height={100}
        displayWidth={200}
      />
      <div className={styles.meta}>
        <div className={styles.top}>
          <Link className={styles.name} to={`/product/${product.slug}`}>
            {product.name}
          </Link>
          <button type="button" className={styles.remove} onClick={remove} disabled={busy}>
            {messages.actions.remove}
          </button>
        </div>
        <p>{variant?.label}</p>
        <p>{formatMoney(view.unitAmount, line.currency)}</p>
        {!purchasable ? (
          <p className={styles.warning}>{messages.product.outOfStock}</p>
        ) : null}
        <div className={styles.controls}>
          <QuantitySelector
            value={line.quantity}
            max={Math.max(1, view.maxQuantity)}
            disabled={busy}
            onChange={changeQuantity}
          />
          <strong>{formatMoney(view.lineAmount, line.currency)}</strong>
        </div>
      </div>
    </article>
  );
}

function imageSrc(view: CartLineView): string {
  return view.product?.images[0]?.src ?? '/placeholders/products/fallback.svg';
}
