import { useEffect } from 'react';
import { messages } from '../../data/messages.ts';
import { clearToast, openCart } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import styles from './Toast.module.css';

export function Toast() {
  const toast = useAppSelector((state) => state.ui.toast);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => dispatch(clearToast()), 4000);
    return () => window.clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) {
    return null;
  }

  return (
    <div className={styles.toast} role="status">
      <span>{toast.message}</span>
      {toast.action === 'open-cart' ? (
        <button
          type="button"
          onClick={() => {
            dispatch(openCart());
            dispatch(clearToast());
          }}
        >
          {messages.actions.viewCart}
        </button>
      ) : null}
    </div>
  );
}
