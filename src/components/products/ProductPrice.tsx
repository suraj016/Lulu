import { messages } from '../../data/messages.ts';
import type { Product, ProductVariant } from '../../types/product.ts';
import { formatMoney } from '../../utils/currency.ts';
import { resolvePrice } from '../../utils/pricing.ts';
import styles from './ProductPrice.module.css';

export function ProductPrice({
  product,
  variant,
  showSavings = false,
  className,
}: {
  product: Product;
  variant?: ProductVariant;
  showSavings?: boolean;
  className?: string;
}) {
  const price = resolvePrice(product, variant);

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <div className={styles.priceRow}>
        <span className={`price ${price.isOnSale ? 'price--sale' : ''}`}>
          {formatMoney(price.amount, price.currency)}
        </span>
        {price.compareAtAmount ? (
          <span className="price price--compare">
            {formatMoney(price.compareAtAmount, price.currency)}
          </span>
        ) : null}
        {showSavings && price.savingsAmount > 0 ? (
          <span className={styles.savingsPill}>
            {messages.product.youSave}{' '}
            {formatMoney(price.savingsAmount, price.currency)}
          </span>
        ) : null}
      </div>
    </div>
  );
}