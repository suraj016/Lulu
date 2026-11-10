import type { ComponentType } from 'react';

type PageModule<Export extends string> = Record<Export, ComponentType>;

function lazyPage<Export extends string>(
  importer: () => Promise<PageModule<Export>>,
  exportName: Export,
) {
  return () =>
    importer().then((module) => ({
      Component: module[exportName],
    }));
}

export const loadAboutPage = lazyPage(
  () => import('../pages/AboutPage/AboutPage.tsx'),
  'AboutPage',
);

export const loadContactPage = lazyPage(
  () => import('../pages/ContactPage/ContactPage.tsx'),
  'ContactPage',
);

export const loadShopPage = lazyPage(
  () => import('../pages/ShopPage/ShopPage.tsx'),
  'ShopPage',
);

export const loadProductRoute = lazyPage(
  () => import('../pages/ProductPage/ProductPage.tsx'),
  'ProductRoute',
);

export const loadCartPage = lazyPage(
  () => import('../pages/CartPage/CartPage.tsx'),
  'CartPage',
);

export const loadWishlistPage = lazyPage(
  () => import('../pages/WishlistPage/WishlistPage.tsx'),
  'WishlistPage',
);

export const loadCheckoutPage = lazyPage(
  () => import('../pages/CheckoutPage/CheckoutPage.tsx'),
  'CheckoutPage',
);

export const loadNotFoundPage = lazyPage(
  () => import('../pages/NotFoundPage/NotFoundPage.tsx'),
  'NotFoundPage',
);

export function prefetchPath(to: string) {
  if (to === '/om-os') {
    void loadAboutPage();
    return;
  }
  if (to === '/kontakt') {
    void loadContactPage();
    return;
  }
  if (to === '/cart') {
    void loadCartPage();
    return;
  }
  if (to === '/wishlist') {
    void loadWishlistPage();
    return;
  }
  if (to === '/kasse') {
    void loadCheckoutPage();
    return;
  }
  if (to.startsWith('/product/')) {
    void loadProductRoute();
    return;
  }
  if (to === '/shop' || to.startsWith('/shop/')) {
    void loadShopPage();
  }
}
