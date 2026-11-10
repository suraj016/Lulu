import { messages } from '../../data/messages.ts';
import { isSafeCheckoutUrl } from '../../services/shopifyCartService.ts';
import { showToast } from '../ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { selectCartView } from './cartSelectors.ts';
import { beginCheckout, rehydrateCart } from './cartSlice.ts';

export function useShopifyCheckout() {
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectCartView);

  const goToCheckout = async () => {
    if (view.isEmpty || view.hasUnavailable || view.busy) {
      return;
    }
    try {
      const cart = await dispatch(beginCheckout()).unwrap();
      if (!cart.checkoutUrl || !isSafeCheckoutUrl(cart.checkoutUrl)) {
        dispatch(showToast({ message: messages.cart.checkoutFailed }));
        return;
      }
      window.location.assign(cart.checkoutUrl);
    } catch {
      dispatch(showToast({ message: messages.cart.checkoutFailed }));
    }
  };

  const retryCart = () => {
    void dispatch(rehydrateCart());
  };

  return { goToCheckout, retryCart, view };
}
