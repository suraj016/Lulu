import { messages } from './messages.ts';

export const mainNavigation = [
  { id: 'home', label: messages.nav.home, to: '/' },
  { id: 'shop', label: messages.nav.shop, to: '/shop' },
  { id: 'about', label: messages.nav.about, to: '/om-os' },
  { id: 'contact', label: messages.nav.contact, to: '/kontakt' },
] as const;

export const shopCollections = [
  { id: 'all', label: 'Alle produkter', to: '/shop' },
  { id: '3d', label: '3D-produkter', to: '/shop/3d-produkter' },
  { id: 'socks', label: 'Sokker', to: '/shop/sokker' },
] as const;

export const footerNavigation = [
  ...mainNavigation,
  { id: 'wishlist', label: messages.nav.wishlist, to: '/wishlist' },
  { id: 'cart', label: messages.nav.cart, to: '/cart' },
] as const;

/**
 * Social destinations stay empty until official URLs are provided.
 * Icons render only when a href is present.
 */
export const socialLinks: Array<{
  id: 'instagram' | 'facebook';
  label: string;
  href?: string;
}> = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
];
