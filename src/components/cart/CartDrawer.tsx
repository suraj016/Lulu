import { messages } from '../../data/messages.ts';
import { useShopifyCheckout } from '../../features/cart/useShopifyCheckout.ts';
import { closeCart } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { Button } from '../ui/Button.tsx';
import { Drawer } from '../ui/Drawer.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { CartItem } from './CartItem.tsx';
import { CartSummary } from './CartSummary.tsx';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const open = useAppSelector((state) => state.ui.cartOpen);
  const { view, goToCheckout, retryCart } = useShopifyCheckout();
  const dispatch = useAppDispatch();
  const close = () => dispatch(closeCart());

  return (
    <Drawer open={open} title={messages.cart.title} onClose={close}>
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
              <Button to="/shop" onClick={close}>
                {messages.actions.continueShopping}
              </Button>
            )
          }
        />
      ) : (
        <div className={styles.stack}>
          {view.migratedFromLegacy ? (
            <p className={styles.note}>{messages.cart.legacyCleared}</p>
          ) : null}
          {view.lines.map((line) => (
            <CartItem key={line.line.id} view={line} />
          ))}
          <CartSummary
            subtotal={view.subtotal}
            total={view.total}
            currency={view.currency}
          />
          {view.hasUnavailable ? (
            <p className={styles.note}>{messages.cart.cannotCheckout}</p>
          ) : null}
          {view.error ? (
            <p className={styles.note}>{view.error}</p>
          ) : (
            <p className={styles.note}>{messages.cart.prototypeNote}</p>
          )}
          <Button to="/cart" onClick={close} fullWidth>
            {messages.actions.viewCart}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void goToCheckout();
            }}
            disabled={view.hasUnavailable || view.busy}
            fullWidth
          >
            {messages.actions.checkout}
          </Button>
        </div>
      )}
    </Drawer>
  );
}
