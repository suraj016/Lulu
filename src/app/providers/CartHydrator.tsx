import { useEffect, type ReactNode } from 'react';
import { rehydrateCart } from '../../features/cart/cartSlice.ts';
import { useAppDispatch } from '../../hooks/store.ts';

export function CartHydrator({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(rehydrateCart());
  }, [dispatch]);

  return children;
}
