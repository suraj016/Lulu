import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import { addItem } from '../../features/cart/cartSlice.ts';
import { openCart, showToast } from '../../features/ui/uiSlice.ts';
import { useAppDispatch } from '../../hooks/store.ts';
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
  const variant = getDefaultVariant(product);
  const price = resolvePrice(product, variant);
  const image = product.images[0];
  const canAdd = isVariantPurchasable(product, variant);

  const quickAdd = () => {
    if (!variant || !canAdd) {
      return;
    }
    dispatch(
      addItem({
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
      }),
    );
    dispatch(
      showToast({
        message: messages.product.addedToCart,
        action: 'open-cart',
      }),
    );
    dispatch(openCart());
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <SafeImage
            src={image?.src ?? '/placeholders/products/fallback.svg'}
            alt={image?.alt ?? product.name}
            width={image?.width}
            height={image?.height}
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
          disabled={!canAdd}
          onClick={quickAdd}
        >
          <Plus size={18} />
        </button>
      </div>
      <Link className={styles.name} to={`/product/${product.slug}`}>
        {product.name}
      </Link>
      <ProductPrice product={product} variant={variant} />
    </article>
  );
}
