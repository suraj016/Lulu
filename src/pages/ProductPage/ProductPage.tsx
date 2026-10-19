import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx';
import { TrustStrip } from '../../components/layout/TrustStrip.tsx';
import { BundleSelector } from '../../components/products/BundleSelector.tsx';
import { ProductGallery } from '../../components/products/ProductGallery.tsx';
import { ProductPrice } from '../../components/products/ProductPrice.tsx';
import { Accordion } from '../../components/ui/Accordion.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ColorSwatch } from '../../components/ui/ColorSwatch.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { QuantitySelector } from '../../components/ui/QuantitySelector.tsx';
import { WishlistButton } from '../../components/wishlist/WishlistButton.tsx';
import { messages } from '../../data/messages.ts';
import { addItem } from '../../features/cart/cartSlice.ts';
import { openCart, showToast } from '../../features/ui/uiSlice.ts';
import { useAppDispatch } from '../../hooks/store.ts';
import {
  getCategoryName,
  getComplementaryProducts,
  getDefaultVariant,
  getProductBySlug,
} from '../../services/productService.ts';
import {
  clampQuantity,
  isVariantPurchasable,
  maxPurchasableQuantity,
} from '../../utils/inventory.ts';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const dispatch = useAppDispatch();
  const defaultVariant = product ? getDefaultVariant(product) : undefined;
  const [variantId, setVariantId] = useState(defaultVariant?.id);
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(
    () => product?.variants.find((item) => item.id === variantId) ?? defaultVariant,
    [product, variantId, defaultVariant],
  );

  if (!product) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <EmptyState
          title={messages.notFound.title}
          body="Vi kunne ikke finde det produkt."
          action={<Button to="/shop">{messages.actions.continueShopping}</Button>}
        />
      </div>
    );
  }

  const gallery = variant?.imageIds.length
    ? product.images.filter((image) => variant.imageIds.includes(image.id))
    : product.images;
  const images = gallery.length > 0 ? gallery : product.images;
  const purchasable = isVariantPurchasable(product, variant);
  const max = variant
    ? maxPurchasableQuantity(variant.inventory)
    : maxPurchasableQuantity(product.inventory);
  const complementary = getComplementaryProducts(product);
  const colorVariants = product.variants.filter(
    (item) => item.colorHex && !item.size,
  );
  const sizeVariants = product.variants.filter((item) => item.size);

  const addToCart = () => {
    if (!variant || !purchasable) {
      return;
    }
    const safeQuantity = clampQuantity(quantity, variant.inventory);
    if (safeQuantity < 1) {
      return;
    }
    dispatch(
      addItem({
        productId: product.id,
        variantId: variant.id,
        quantity: safeQuantity,
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
    <div className={`container ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: messages.nav.shop, to: '/shop' },
          {
            label: getCategoryName(product.categoryId),
            to:
              product.productType === 'socks'
                ? '/shop/sokker'
                : '/shop/3d-produkter',
          },
          { label: product.name },
        ]}
      />
      <div className={styles.layout}>
        <ProductGallery images={images} />
        <div className={styles.summary}>
          <div className={styles.badges}>
            {product.isBestSeller ? (
              <Badge>{messages.product.bestsellerBadge}</Badge>
            ) : null}
            {product.isNew ? <Badge tone="soft">{messages.product.newBadge}</Badge> : null}
          </div>
          {product.ratingSummary ? (
            <p className={styles.fixture}>
              {product.ratingSummary.average.toLocaleString('da-DK')} / 5 ·{' '}
              {product.ratingSummary.count} · {messages.product.fixtureRating}
            </p>
          ) : null}
          <h1>{product.name}</h1>
          <ProductPrice product={product} variant={variant} showSavings />
          <p>{product.shortDescription}</p>
          <p>
            {purchasable ? messages.product.inStock : messages.product.outOfStock}
            {variant ? ` · ${messages.product.sku} ${variant.sku}` : ''}
          </p>

          {colorVariants.length > 0 ? (
            <div>
              <p>
                {messages.product.chooseColor}
                {variant?.colorName ? `: ${variant.colorName}` : ''}
              </p>
              <div className={styles.swatches}>
                {colorVariants.map((item) => (
                  <ColorSwatch
                    key={item.id}
                    label={item.colorName ?? item.label}
                    hex={item.colorHex ?? '#ccc'}
                    selected={item.id === variant?.id}
                    disabled={!item.isAvailable}
                    onSelect={() => {
                      setVariantId(item.id);
                      setQuantity(1);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {sizeVariants.length > 0 ? (
            <label>
              {messages.product.chooseSize}
              <select
                value={variant?.id}
                onChange={(event) => setVariantId(event.target.value)}
                style={{
                  display: 'block',
                  marginTop: '0.4rem',
                  minHeight: '2.7rem',
                  padding: '0.4rem 0.7rem',
                  borderRadius: '999px',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                }}
              >
                {sizeVariants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.size}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <p>{messages.product.quantity}</p>
            <QuantitySelector
              value={quantity}
              max={Math.max(1, max)}
              onChange={setQuantity}
            />
            {quantity >= max && max > 0 ? (
              <p className={styles.fixture}>{messages.product.quantityLimit}</p>
            ) : null}
          </div>

          <div className={styles.actions}>
            <Button onClick={addToCart} disabled={!purchasable} fullWidth>
              {messages.actions.addToCart}
            </Button>
            <div className={styles.wishlistRow}>
              <WishlistButton productId={product.id} />
              <span>{messages.nav.wishlist}</span>
            </div>
          </div>
          <div className={styles.benefits}>
            <TrustStrip variant="product" />
          </div>
          <Accordion
            items={[
              {
                id: 'details',
                title: messages.product.details,
                content: product.details,
              },
              {
                id: 'material',
                title: messages.product.materialSafety,
                content: product.materialSafety,
              },
              {
                id: 'delivery',
                title: messages.product.delivery,
                content: product.deliveryInformation,
              },
            ]}
          />
        </div>
      </div>
      <div className={styles.bundle}>
        <BundleSelector product={product} complementary={complementary} />
      </div>
    </div>
  );
}

export function ProductRoute() {
  const { slug } = useParams();
  return <ProductPage key={slug} />;
}
