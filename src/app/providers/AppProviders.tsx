import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store.ts';
import { CartHydrator } from './CartHydrator.tsx';
import { CatalogProvider } from './CatalogGate.tsx';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <CatalogProvider>
        <CartHydrator>{children}</CartHydrator>
      </CatalogProvider>
    </Provider>
  );
}
