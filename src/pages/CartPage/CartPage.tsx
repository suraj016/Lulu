import { CartItem } from '../../components/cart/CartItem.tsx';
import { CartSummary } from '../../components/cart/CartSummary.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { messages } from '../../data/messages.ts';
import { selectCartView } from '../../features/cart/cartSelectors.ts';
import { useAppSelector } from '../../hooks/store.ts';
import styles from './CartPage.module.css';

export function CartPage() {
  const view = useAppSelector(selectCartView);

  return (
    <div className={`container ${styles.page}`}>
      <h1>{messages.cart.title}</h1>
      {view.isEmpty ? (
        <EmptyState
          title={messages.cart.empty}
          body={messages.cart.emptyHint}
          action={<Button to="/shop">{messages.actions.continueShopping}</Button>}
        />
      ) : (
        <div className={styles.layout}>
          <div className={styles.lines}>
            {view.lines.map((line) => (
              <CartItem key={line.line.id} view={line} />
            ))}
          </div>
          <aside className={styles.summary}>
            <CartSummary subtotal={view.subtotal} />
            <p style={{ fontSize: '0.9rem', margin: '1rem 0' }}>
              {messages.cart.prototypeNote}
            </p>
            {view.hasUnavailable ? (
              <p>{messages.cart.cannotCheckout}</p>
            ) : null}
            <div className={styles.actions}>
              {view.hasUnavailable ? (
                <Button disabled fullWidth>
                  {messages.actions.checkout}
                </Button>
              ) : (
                <Button to="/kasse" fullWidth>
                  {messages.actions.checkout}
                </Button>
              )}
              <Button to="/shop" variant="secondary" fullWidth>
                {messages.actions.continueShopping}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
