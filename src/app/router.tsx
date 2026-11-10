import { createBrowserRouter } from 'react-router-dom';
import { RouteFallback } from '../components/layout/RouteFallback.tsx';
import { SiteLayout } from '../components/layout/SiteLayout.tsx';
import { HomePage } from '../pages/HomePage/HomePage.tsx';
import {
  loadAboutPage,
  loadCartPage,
  loadCheckoutPage,
  loadContactPage,
  loadNotFoundPage,
  loadProductRoute,
  loadShopPage,
  loadWishlistPage,
} from './lazyRoutes.ts';
import { CatalogReadyLayout } from './providers/CatalogGate.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    hydrateFallbackElement: <RouteFallback />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'om-os', lazy: loadAboutPage },
      { path: 'kontakt', lazy: loadContactPage },
      {
        element: <CatalogReadyLayout />,
        hydrateFallbackElement: <RouteFallback />,
        children: [
          { path: 'shop', lazy: loadShopPage },
          { path: 'shop/:collectionSlug', lazy: loadShopPage },
          { path: 'product/:slug', lazy: loadProductRoute },
          { path: 'cart', lazy: loadCartPage },
          { path: 'wishlist', lazy: loadWishlistPage },
          { path: 'kasse', lazy: loadCheckoutPage },
        ],
      },
      { path: '*', lazy: loadNotFoundPage },
    ],
  },
]);
