import { NavLink } from 'react-router-dom';
import { mainNavigation, shopCollections } from '../../data/mockNavigation.ts';
import { messages } from '../../data/messages.ts';
import { closeMobileNav } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { Drawer } from '../ui/Drawer.tsx';

export function MobileNavigation() {
  const open = useAppSelector((state) => state.ui.mobileNavOpen);
  const dispatch = useAppDispatch();
  const close = () => dispatch(closeMobileNav());

  return (
    <Drawer open={open} title={messages.header.menu} onClose={close} side="left">
      <nav aria-label="Mobilmenu">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
          {mainNavigation.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                onClick={close}
                style={{ fontSize: '1.35rem', fontWeight: 650, textDecoration: 'none', color: 'var(--color-ink)' }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="eyebrow" style={{ marginTop: '2rem' }}>
          {messages.nav.shop}
        </p>
        <ul style={{ listStyle: 'none', margin: '0.75rem 0 0', padding: 0, display: 'grid', gap: '0.7rem' }}>
          {shopCollections.map((item) => (
            <li key={item.id}>
              <NavLink to={item.to} onClick={close}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
