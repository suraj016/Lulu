import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom';
import { messages } from '../../data/messages.ts';
import { useAppSelector } from '../../hooks/store.ts';
import { Footer } from './Footer.tsx';
import { Header } from './Header.tsx';
import { OverlayGate } from './OverlayGate.tsx';
import {
  AccountDialog,
  CartDrawer,
  MobileNavigation,
  SearchDialog,
} from './overlays.tsx';
import { Toast } from './Toast.tsx';
import styles from './SiteLayout.module.css';

export function SiteLayout() {
  const navigation = useNavigation();
  const cartOpen = useAppSelector((state) => state.ui.cartOpen);
  const searchOpen = useAppSelector((state) => state.ui.searchOpen);
  const accountOpen = useAppSelector((state) => state.ui.accountOpen);
  const mobileNavOpen = useAppSelector((state) => state.ui.mobileNavOpen);
  const isRoutePending = navigation.state === 'loading';

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#indhold">
        Spring til indhold
      </a>
      <Header />
      <main
        id="indhold"
        className={styles.main}
        aria-busy={isRoutePending || undefined}
      >
        {isRoutePending ? (
          <p className="visually-hidden" aria-live="polite">
            {messages.app.loadingPage}
          </p>
        ) : null}
        <Outlet />
      </main>
      <Footer />
      <OverlayGate open={cartOpen}>
        <CartDrawer />
      </OverlayGate>
      <OverlayGate open={searchOpen}>
        <SearchDialog />
      </OverlayGate>
      <OverlayGate open={accountOpen}>
        <AccountDialog />
      </OverlayGate>
      <OverlayGate open={mobileNavOpen}>
        <MobileNavigation />
      </OverlayGate>
      <Toast />
      <ScrollRestoration />
    </div>
  );
}
