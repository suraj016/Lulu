import { Button } from '../../components/ui/Button.tsx';
import { messages } from '../../data/messages.ts';
import { selectCartView } from '../../features/cart/cartSelectors.ts';
import { useAppSelector } from '../../hooks/store.ts';
import { formatMoney } from '../../utils/currency.ts';

export function CheckoutPage() {
  const view = useAppSelector(selectCartView);

  return (
    <div className="container" style={{ padding: '2.5rem 0 4.5rem', maxWidth: '40rem' }}>
      <h1>{messages.checkout.title}</h1>
      <p style={{ margin: '1rem 0 1.5rem' }}>{messages.checkout.body}</p>
      <p>
        {messages.cart.subtotal}:{' '}
        <strong>{formatMoney(view.subtotal)}</strong>
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <Button to="/cart" variant="secondary">
          {messages.nav.cart}
        </Button>
        <Button to="/shop">{messages.actions.continueShopping}</Button>
      </div>
    </div>
  );
}
