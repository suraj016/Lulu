import { ProductGrid } from '../../components/products/ProductGrid.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { messages } from '../../data/messages.ts';
import { selectWishlistProducts } from '../../features/wishlist/wishlistSelectors.ts';
import { useAppSelector } from '../../hooks/store.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import styles from './WishlistPage.module.css';

export function WishlistPage() {
  const products = useAppSelector(selectWishlistProducts);
  usePageMeta({
    title: pageTitle(messages.wishlist.title),
    description: messages.seo.defaultDescription,
    path: '/wishlist',
    robots: messages.seo.cartRobots,
  });

  return (
    <div className="container page-block">
      <h1>{messages.wishlist.title}</h1>
      {products.length === 0 ? (
        <EmptyState
          title={messages.wishlist.empty}
          body={messages.wishlist.emptyHint}
          action={<Button to="/shop">{messages.actions.continueShopping}</Button>}
        />
      ) : (
        <div className={styles.grid}>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
