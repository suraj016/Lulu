import { NavLink } from 'react-router-dom';
import { prefetchPath } from '../../app/lazyRoutes.ts';
import { mainNavigation, shopCollections } from '../../data/mockNavigation.ts';
import { messages } from '../../data/messages.ts';
import { closeMobileNav } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { Drawer } from '../ui/Drawer.tsx';
import styles from './MobileNavigation.module.css';

export function MobileNavigation() {
  const open = useAppSelector((state) => state.ui.mobileNavOpen);
  const dispatch = useAppDispatch();
  const close = () => dispatch(closeMobileNav());

  return (
    <Drawer open={open} title={messages.header.menu} onClose={close} side="left">
      <nav aria-label="Mobilmenu">
        <ul className={styles.links}>
          {mainNavigation.map((item) => (
            <li key={item.id}>
              <NavLink
                className={styles.link}
                to={item.to}
                onClick={close}
                onPointerEnter={() => prefetchPath(item.to)}
                onFocus={() => prefetchPath(item.to)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className={`eyebrow ${styles.shopEyebrow}`}>
          {messages.nav.shop}
        </p>
        <ul className={styles.shopLinks}>
          {shopCollections.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                onClick={close}
                onPointerEnter={() => prefetchPath(item.to)}
                onFocus={() => prefetchPath(item.to)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
