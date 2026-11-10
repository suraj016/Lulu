import { messages } from '../../data/messages.ts';
import { CurrencyCode } from '../../types/product.ts';
import { formatMoney } from '../../utils/currency.ts';
import styles from './CartSummary.module.css';

export function CartSummary({
  subtotal,
  total,
  currency,
}: {
  subtotal: number;
  total: number;
  currency: CurrencyCode;
}) {
  return (
    <dl className={styles.list}>
      <div className={styles.row}>
        <dt>{messages.cart.subtotal}</dt>
        <dd>{formatMoney(subtotal, currency)}</dd>
      </div>
      <div className={styles.row}>
        <dt>{messages.cart.shipping}</dt>
        <dd>{messages.cart.shippingPlaceholder}</dd>
      </div>
      <div className={`${styles.row} ${styles.total}`}>
        <dt>{messages.cart.total}</dt>
        <dd>{formatMoney(total, currency)}</dd>
      </div>
    </dl>
  );
}
