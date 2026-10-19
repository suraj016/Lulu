import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '../components/layout/SiteLayout.tsx';
import { AboutPage } from '../pages/AboutPage/AboutPage.tsx';
import { CartPage } from '../pages/CartPage/CartPage.tsx';
import { CheckoutPage } from '../pages/CheckoutPage/CheckoutPage.tsx';
import { ContactPage } from '../pages/ContactPage/ContactPage.tsx';
import { HomePage } from '../pages/HomePage/HomePage.tsx';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage.tsx';
import { ProductRoute } from '../pages/ProductPage/ProductPage.tsx';
import { ShopPage } from '../pages/ShopPage/ShopPage.tsx';
import { WishlistPage } from '../pages/WishlistPage/WishlistPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:collectionSlug', element: <ShopPage /> },
      { path: 'product/:slug', element: <ProductRoute /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'om-os', element: <AboutPage /> },
      { path: 'kontakt', element: <ContactPage /> },
      { path: 'kasse', element: <CheckoutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
