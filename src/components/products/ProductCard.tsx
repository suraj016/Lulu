import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { prefetchPath } from '../../app/lazyRoutes.ts';
import { messages } from '../../data/messages.ts';
import { addItem } from '../../features/cart/cartSlice.ts';
import { openCart, showToast } from '../../features/ui/uiSlice.ts';
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import { getDefaultVariant } from '../../services/productService.ts';
import type { Product } from '../../types/product.ts';
import { isVariantPurchasable } from '../../utils/inventory.ts';
import { resolvePrice } from '../../utils/pricing.ts';
import { Badge } from '../ui/Badge.tsx';
import { SafeImage } from '../ui/SafeImage.tsx';
import { WishlistButton } from '../wishlist/WishlistButton.tsx';
import { ProductPrice } from './ProductPrice.tsx';
import styles from './ProductCard.module.css';

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const cartBusy = useAppSelector((state) => state.cart.status === 'loading');
  const variant = getDefaultVariant(product);
  const price = resolvePrice(product, variant);
  const image = product.images[0];
  const canAdd = isVariantPurchasable(product, variant);
  const productHref = `/product/${product.slug}`;
  const prefetchProduct = () => prefetchPath(productHref);

  const quickAdd = () => {
    if (!variant || !canAdd || cartBusy) {
      return;
    }
    void dispatch(
      addItem({
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
      }),
    )
      .unwrap()
      .then(() => {
        dispatch(
          showToast({
            message: messages.product.addedToCart,
            action: 'open-cart',
          }),
        );
        dispatch(openCart());
      })
      .catch(() => {
        dispatch(showToast({ message: messages.cart.updateFailed }));
      });
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link
          to={productHref}
          aria-label={product.name}
          onPointerEnter={prefetchProduct}
          onFocus={prefetchProduct}
        >
          <SafeImage
            src={image?.src ?? '/placeholders/products/fallback.svg'}
            alt={image?.alt ?? product.name}
            width={image?.width}
            height={image?.height}
            displayWidth={640}
            sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
          />
        </Link>
        <div className={styles.badges}>
          {product.isNew ? <Badge>{messages.product.newBadge}</Badge> : null}
          {price.isOnSale ? (
            <Badge tone="sale">{messages.product.saleBadge}</Badge>
          ) : null}
        </div>
        <div className={styles.wishlist}>
          <WishlistButton productId={product.id} />
        </div>
        <button
          className={styles.quick}
          type="button"
          aria-label={messages.actions.addToCart}
          disabled={!canAdd || cartBusy}
          onPointerEnter={() => {
            void import('../cart/CartDrawer.tsx');
          }}
          onClick={quickAdd}
        >
          <Plus size={18} />
        </button>
      </div>
      <Link
        className={styles.name}
        to={productHref}
        onPointerEnter={prefetchProduct}
        onFocus={prefetchProduct}
      >
        {product.name}
      </Link>
      <ProductPrice product={product} variant={variant} />
    </article>
  );
}
