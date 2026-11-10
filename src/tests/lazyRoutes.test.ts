import { describe, expect, it } from 'vitest';
import {
  loadAboutPage,
  loadCartPage,
  loadCheckoutPage,
  loadContactPage,
  loadNotFoundPage,
  loadProductRoute,
  loadShopPage,
  loadWishlistPage,
  prefetchPath,
} from '../app/lazyRoutes.ts';

describe('lazy route loaders', () => {
  it('exposes loaders for pages that are not part of the homepage shell', () => {
    expect(typeof loadShopPage).toBe('function');
    expect(typeof loadProductRoute).toBe('function');
    expect(typeof loadCartPage).toBe('function');
    expect(typeof loadWishlistPage).toBe('function');
    expect(typeof loadCheckoutPage).toBe('function');
    expect(typeof loadAboutPage).toBe('function');
    expect(typeof loadContactPage).toBe('function');
    expect(typeof loadNotFoundPage).toBe('function');
  });

  it('ignores paths that stay in the initial bundle', () => {
    expect(() => prefetchPath('/')).not.toThrow();
  });
});
