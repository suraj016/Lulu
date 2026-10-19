import { Outlet, ScrollRestoration } from 'react-router-dom';
import { AccountDialog } from './AccountDialog.tsx';
import { Footer } from './Footer.tsx';
import { Header } from './Header.tsx';
import { MobileNavigation } from './MobileNavigation.tsx';
import { SearchDialog } from './SearchDialog.tsx';
import { Toast } from './Toast.tsx';
import { CartDrawer } from '../cart/CartDrawer.tsx';
import styles from './SiteLayout.module.css';

export function SiteLayout() {
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#indhold">
        Spring til indhold
      </a>
      <Header />
      <main id="indhold" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchDialog />
      <AccountDialog />
      <MobileNavigation />
      <Toast />
      <ScrollRestoration />
    </div>
  );
}
