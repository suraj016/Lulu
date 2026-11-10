import { Button } from '../../components/ui/Button.tsx';
import { messages } from '../../data/messages.ts';
import { useShopifyCheckout } from '../../features/cart/useShopifyCheckout.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import { formatMoney } from '../../utils/currency.ts';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const { view, goToCheckout } = useShopifyCheckout();
  usePageMeta({
    title: pageTitle(messages.checkout.title),
    description: messages.checkout.body,
    path: '/kasse',
    robots: messages.seo.cartRobots,
  });

  return (
    <div className={`container page-block ${styles.page}`}>
      <h1>{messages.checkout.title}</h1>
      <p className={styles.body}>{messages.checkout.body}</p>
      {view.isEmpty ? (
        <p>{messages.cart.empty}</p>
      ) : (
        <p>
          {messages.cart.total}:{' '}
          <strong>{formatMoney(view.total, view.currency)}</strong>
        </p>
      )}
      {view.error ? <p className={styles.error}>{view.error}</p> : null}
      <div className={styles.actions}>
        <Button to="/cart" variant="secondary">
          {messages.nav.cart}
        </Button>
        {view.isEmpty ? (
          <Button to="/shop">{messages.actions.continueShopping}</Button>
        ) : (
          <Button
            onClick={() => void goToCheckout()}
            disabled={view.hasUnavailable || view.busy}
          >
            {messages.actions.checkout}
          </Button>
        )}
      </div>
    </div>
  );
}
