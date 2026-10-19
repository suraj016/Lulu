import { messages } from '../../data/messages.ts';
import { selectCartView } from '../../features/cart/cartSelectors.ts';
import { closeCart } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { Button } from '../ui/Button.tsx';
import { Drawer } from '../ui/Drawer.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { CartItem } from './CartItem.tsx';
import { CartSummary } from './CartSummary.tsx';

export function CartDrawer() {
  const open = useAppSelector((state) => state.ui.cartOpen);
  const view = useAppSelector(selectCartView);
  const dispatch = useAppDispatch();
  const close = () => dispatch(closeCart());

  return (
    <Drawer open={open} title={messages.cart.title} onClose={close}>
      {view.isEmpty ? (
        <EmptyState
          title={messages.cart.empty}
          body={messages.cart.emptyHint}
          action={
            <Button to="/shop" onClick={close}>
              {messages.actions.continueShopping}
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {view.lines.map((line) => (
            <CartItem key={line.line.id} view={line} />
          ))}
          <CartSummary subtotal={view.subtotal} />
          <p style={{ fontSize: '0.85rem' }}>{messages.cart.prototypeNote}</p>
          <Button to="/cart" onClick={close} fullWidth>
            {messages.actions.viewCart}
          </Button>
          <Button
            to="/kasse"
            variant="secondary"
            onClick={close}
            fullWidth
          >
            {messages.actions.checkout}
          </Button>
        </div>
      )}
    </Drawer>
  );
}
