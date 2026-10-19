import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store.ts';

export function AppProviders({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
