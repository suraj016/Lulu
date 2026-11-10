import { Link, NavLink } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { brandAssets } from '../../assets/manifest.ts';
import { mainNavigation } from '../../data/mockNavigation.ts';
import { messages } from '../../data/messages.ts';
import { selectCartItemQuantity } from '../../features/cart/cartSelectors.ts';
import {
  openAccount,
  openCart,
  openMobileNav,
  openSearch,
} from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { prefetchPath } from '../../app/lazyRoutes.ts';
import { IconButton } from '../ui/IconButton.tsx';
import styles from './Header.module.css';

export function Header() {
  const dispatch = useAppDispatch();
  const quantity = useAppSelector(selectCartItemQuantity);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link className={styles.logo} to="/" aria-label={messages.brand}>
          <img
            src={brandAssets.logo.src}
            alt={brandAssets.logo.alt}
            width={brandAssets.logo.width}
            height={brandAssets.logo.height}
          />
        </Link>
        <nav className={styles.nav} aria-label="Hovedmenu">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={styles.link}
              end={item.to === '/'}
              onPointerEnter={() => prefetchPath(item.to)}
              onFocus={() => prefetchPath(item.to)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <IconButton
            className={styles.menuButton}
            label={messages.header.openMenu}
            onPointerEnter={() => {
              void import('./MobileNavigation.tsx');
            }}
            onFocus={() => {
              void import('./MobileNavigation.tsx');
            }}
            onClick={() => dispatch(openMobileNav())}
          >
            <Menu size={22} />
          </IconButton>
          <IconButton
            label={messages.header.search}
            onPointerEnter={() => {
              void import('./SearchDialog.tsx');
            }}
            onFocus={() => {
              void import('./SearchDialog.tsx');
            }}
            onClick={() => dispatch(openSearch())}
          >
            <Search size={20} />
          </IconButton>
          <IconButton
            label={messages.header.account}
            onPointerEnter={() => {
              void import('./AccountDialog.tsx');
            }}
            onFocus={() => {
              void import('./AccountDialog.tsx');
            }}
            onClick={() => dispatch(openAccount())}
          >
            <User size={20} />
          </IconButton>
          <IconButton
            label={messages.header.cart}
            badge={quantity}
            onPointerEnter={() => {
              void import('../cart/CartDrawer.tsx');
            }}
            onFocus={() => {
              void import('../cart/CartDrawer.tsx');
            }}
            onClick={() => dispatch(openCart())}
          >
            <ShoppingBag size={20} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
