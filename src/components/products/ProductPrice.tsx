import { messages } from '../../data/messages.ts';
import type { Product, ProductVariant } from '../../types/product.ts';
import { formatMoney } from '../../utils/currency.ts';
import { resolvePrice } from '../../utils/pricing.ts';

export function ProductPrice({
  product,
  variant,
  showSavings = false,
}: {
  product: Product;
  variant?: ProductVariant;
  showSavings?: boolean;
}) {
  const price = resolvePrice(product, variant);

  return (
    <div>
      <span className={`price ${price.isOnSale ? 'price--sale' : ''}`}>
        {formatMoney(price.amount, price.currency)}
      </span>
      {price.compareAtAmount ? (
        <>
          {' '}
          <span className="price price--compare">
            {formatMoney(price.compareAtAmount, price.currency)}
          </span>
        </>
      ) : null}
      {showSavings && price.savingsAmount > 0 ? (
        <p>
          {messages.product.youSave}{' '}
          {formatMoney(price.savingsAmount, price.currency)}
        </p>
      ) : null}
    </div>
  );
}
