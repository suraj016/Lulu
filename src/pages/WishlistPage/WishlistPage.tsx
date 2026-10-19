import { ProductGrid } from '../../components/products/ProductGrid.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { messages } from '../../data/messages.ts';
import { selectWishlistProducts } from '../../features/wishlist/wishlistSelectors.ts';
import { useAppSelector } from '../../hooks/store.ts';

export function WishlistPage() {
  const products = useAppSelector(selectWishlistProducts);

  return (
    <div className="container" style={{ padding: '2.5rem 0 4.5rem' }}>
      <h1>{messages.wishlist.title}</h1>
      {products.length === 0 ? (
        <EmptyState
          title={messages.wishlist.empty}
          body={messages.wishlist.emptyHint}
          action={<Button to="/shop">{messages.actions.continueShopping}</Button>}
        />
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
