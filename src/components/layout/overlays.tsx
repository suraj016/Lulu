import { lazy } from 'react';

export const CartDrawer = lazy(() =>
  import('../cart/CartDrawer.tsx').then((module) => ({
    default: module.CartDrawer,
  })),
);

export const SearchDialog = lazy(() =>
  import('./SearchDialog.tsx').then((module) => ({
    default: module.SearchDialog,
  })),
);

export const AccountDialog = lazy(() =>
  import('./AccountDialog.tsx').then((module) => ({
    default: module.AccountDialog,
  })),
);

export const MobileNavigation = lazy(() =>
  import('./MobileNavigation.tsx').then((module) => ({
    default: module.MobileNavigation,
  })),
);
