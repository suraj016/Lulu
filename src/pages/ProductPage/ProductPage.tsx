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
import { useAppDispatch, useAppSelector } from '../../hooks/store.ts';
import {
  getCategoryName,
  getComplementaryProducts,
  getDefaultVariant,
  getProductBySlug,
} from '../../services/productService.ts';
import { UNMAPPED_CATEGORY_ID } from '../../types/product.ts';
import {
  clampQuantity,
  isVariantPurchasable,
  maxPurchasableQuantity,
} from '../../utils/inventory.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const dispatch = useAppDispatch();
  const cartBusy = useAppSelector((state) => state.cart.status === 'loading');
  const defaultVariant = product ? getDefaultVariant(product) : undefined;
  const [variantId, setVariantId] = useState(defaultVariant?.id);
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(
    () => product?.variants.find((item) => item.id === variantId) ?? defaultVariant,
    [product, variantId, defaultVariant],
  );

  usePageMeta({
    title: pageTitle(product?.name ?? messages.notFound.title),
    description: product?.shortDescription || messages.product.notFoundBody,
    path: slug ? `/product/${slug}` : '/product',
    image: product?.images[0]?.src,
    robots: product ? undefined : 'noindex',
  });

  if (!product) {
    return (
      <div className="container page-status">
        <EmptyState
          title={messages.notFound.title}
          body={messages.product.notFoundBody}
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
  const quantityMax = Math.max(1, max);
  const quantityValue = Math.min(Math.max(1, quantity), quantityMax);
  const complementary = getComplementaryProducts(product);
  const colorVariants = product.variants.filter(
    (item) => item.colorHex && !item.size,
  );
  const sizeVariants = product.variants.filter((item) => item.size);
  const accordionItems = [
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
  ].filter((item) => item.content.length > 0);

  const addToCart = () => {
    if (!variant || !purchasable || cartBusy) {
      return;
    }
    const safeQuantity = clampQuantity(quantity, variant.inventory);
    if (safeQuantity < 1) {
      return;
    }
    void dispatch(
      addItem({
        productId: product.id,
        variantId: variant.id,
        quantity: safeQuantity,
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
    <div className={`container ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: messages.nav.shop, to: '/shop' },
          ...(product.categoryId === UNMAPPED_CATEGORY_ID
            ? []
            : [
                {
                  label: getCategoryName(product.categoryId),
                  to:
                    product.productType === 'socks'
                      ? '/shop/sokker'
                      : product.productType === 'printed-3d'
                        ? '/shop/3d-produkter'
                        : '/shop',
                },
              ]),
          { label: product.name },
        ]}
      />
      <div className={styles.layout}>
        <ProductGallery key={variant?.id ?? product.id} images={images} />
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
            {variant?.sku ? ` · ${messages.product.sku} ${variant.sku}` : ''}
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
                onChange={(event) => {
                  setVariantId(event.target.value);
                  setQuantity(1);
                }}
                className={`control ${styles.sizeSelect}`}
              >
                {sizeVariants.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={!item.isAvailable}
                  >
                    {item.size}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <p>{messages.product.quantity}</p>
            <QuantitySelector
              value={quantityValue}
              max={quantityMax}
              onChange={setQuantity}
            />
            {quantityValue >= max && max > 0 ? (
              <p className={styles.fixture}>{messages.product.quantityLimit}</p>
            ) : null}
          </div>

          <div className={styles.actions}>
            <Button onClick={addToCart} disabled={!purchasable || cartBusy} fullWidth>
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
          {accordionItems.length > 0 ? (
            <Accordion items={accordionItems} />
          ) : null}
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
