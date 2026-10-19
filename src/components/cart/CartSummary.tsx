import { messages } from '../../data/messages.ts';
import { formatMoney } from '../../utils/currency.ts';

export function CartSummary({
  subtotal,
  currency = 'DKK',
}: {
  subtotal: number;
  currency?: 'DKK';
}) {
  return (
    <dl style={{ display: 'grid', gap: '0.55rem', margin: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <dt>{messages.cart.subtotal}</dt>
        <dd style={{ margin: 0 }}>{formatMoney(subtotal, currency)}</dd>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <dt>{messages.cart.shipping}</dt>
        <dd style={{ margin: 0 }}>{messages.cart.shippingPlaceholder}</dd>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--color-ink)' }}>
        <dt>{messages.cart.total}</dt>
        <dd style={{ margin: 0 }}>{formatMoney(subtotal, currency)}</dd>
      </div>
    </dl>
  );
}
