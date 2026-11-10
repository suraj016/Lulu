import { CartItem } from '../../components/cart/CartItem.tsx';
import { CartSummary } from '../../components/cart/CartSummary.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { messages } from '../../data/messages.ts';
import { useShopifyCheckout } from '../../features/cart/useShopifyCheckout.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import styles from './CartPage.module.css';

export function CartPage() {
  const { view, goToCheckout, retryCart } = useShopifyCheckout();
  usePageMeta({
    title: pageTitle(messages.cart.title),
    description: messages.seo.defaultDescription,
    path: '/cart',
    robots: messages.seo.cartRobots,
  });

  return (
    <div className={`container ${styles.page}`}>
      <h1>{messages.cart.title}</h1>
      {view.isEmpty ? (
        <EmptyState
          title={messages.cart.empty}
          body={
            view.error ??
            (view.migratedFromLegacy
              ? messages.cart.legacyCleared
              : messages.cart.emptyHint)
          }
          action={
            view.error && view.cartId ? (
              <Button onClick={() => retryCart()}>{messages.cart.retry}</Button>
            ) : (
              <Button to="/shop">{messages.actions.continueShopping}</Button>
            )
          }
        />
      ) : (
        <div className={styles.layout}>
          <div className={styles.lines}>
            {view.migratedFromLegacy ? (
              <p className={styles.note}>{messages.cart.legacyCleared}</p>
            ) : null}
            {view.lines.map((line) => (
              <CartItem key={line.line.id} view={line} />
            ))}
          </div>
          <aside className={styles.summary}>
            <CartSummary
              subtotal={view.subtotal}
              total={view.total}
              currency={view.currency}
            />
            <p className={styles.note}>{view.error ?? messages.cart.prototypeNote}</p>
            {view.hasUnavailable ? (
              <p>{messages.cart.cannotCheckout}</p>
            ) : null}
            <div className={styles.actions}>
              <Button
                onClick={() => void goToCheckout()}
                disabled={view.hasUnavailable || view.busy}
                fullWidth
              >
                {messages.actions.checkout}
              </Button>
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
