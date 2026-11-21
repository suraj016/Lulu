import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx';
import { ProductHighlights } from '../../components/products/ProductHighlights.tsx';
import { BundleSelector } from '../../components/products/BundleSelector.tsx';
import { ProductGallery } from '../../components/products/ProductGallery.tsx';
import { ProductPrice } from '../../components/products/ProductPrice.tsx';
import priceStyles from '../../components/products/ProductPrice.module.css';
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
  getVariantInventory,
  isVariantPurchasable,
  maxPurchasableQuantity,
} from '../../utils/inventory.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import { formatVariantSize } from '../../utils/sizeLabel.ts';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const dispatch = useAppDispatch();
  const cartBusy = useAppSelector((state) => state.cart.status === 'loading');
  const defaultVariant = product ? getDefaultVariant(product) : undefined;
  const [variantId, setVariantId] = useState(() => defaultVariant?.id);
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(
    () => product?.variants.find((item) => item.id === variantId) ?? defaultVariant,
    [product, variantId, defaultVariant],
  );

  useEffect(() => {
    if (!defaultVariant?.id) {
      return;
    }
    setVariantId((current) => current ?? defaultVariant.id);
  }, [defaultVariant?.id]);

  const quantityMax = useMemo(() => {
    if (!product) {
      return 1;
    }
    const inventory = getVariantInventory(product, variant);
    return Math.max(1, maxPurchasableQuantity(inventory));
  }, [product, variant]);

  useEffect(() => {
    if (!product) {
      return;
    }
    setQuantity((current) =>
      clampQuantity(current, getVariantInventory(product, variant)),
    );
  }, [product, variant, quantityMax]);

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
  const complementary = getComplementaryProducts(product);
  const selectedSizeLabel = variant?.size
    ? formatVariantSize(variant.size, variant.label)
    : '';

  const changeQuantity = (next: number) => {
    const inventory = getVariantInventory(product, variant);
    setQuantity(clampQuantity(next, inventory));
  };
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
    const safeQuantity = clampQuantity(
      quantity,
      getVariantInventory(product, variant),
    );
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
        <div className={styles.galleryCol}>
          <ProductGallery key={variant?.id ?? product.id} images={images} />
        </div>
        <div className={styles.summary}>
          <header className={styles.summaryHead}>
            {product.isNew ? (
              <div className={styles.badges}>
                <Badge tone="soft">{messages.product.newBadge}</Badge>
              </div>
            ) : null}
            {product.ratingSummary ? (
              <p className={styles.fixture}>
                {product.ratingSummary.average.toLocaleString('da-DK')} / 5 ·{' '}
                {product.ratingSummary.count} · {messages.product.fixtureRating}
              </p>
            ) : null}
            <h1>{product.name}</h1>
            <ProductPrice
              product={product}
              variant={variant}
              showSavings
              className={priceStyles.pdp}
            />
          </header>
          {product.shortDescription ? (
            <p className={styles.lede}>{product.shortDescription}</p>
          ) : null}
          <p
            className={
              purchasable ? `${styles.stockMeta} ${styles.inStock}` : styles.stockMeta
            }
          >
            {purchasable ? messages.product.inStock : messages.product.outOfStock}
          </p>

          <div className={styles.buyBox}>
          {colorVariants.length > 0 ? (
            <div className={styles.optionGroup}>
              <p className={styles.optionLabel} id={`${product.id}-color-label`}>
                {messages.product.chooseColor}
                {variant?.colorName ? `: ${variant.colorName}` : ''}
              </p>
              <div
                className={styles.swatches}
                role="radiogroup"
                aria-labelledby={`${product.id}-color-label`}
              >
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
            <div className={styles.optionGroup}>
              <p className={styles.optionLabel} id={`${product.id}-size-label`}>
                {messages.product.chooseSize}
                {selectedSizeLabel ? `: ${selectedSizeLabel}` : ''}
              </p>
              <div
                className={styles.optionList}
                role="radiogroup"
                aria-labelledby={`${product.id}-size-label`}
              >
                {sizeVariants.map((item) => {
                  const selected = item.id === variant?.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      className={`${styles.optionButton} ${styles.sizeOption}`}
                      aria-checked={selected}
                      aria-label={
                        item.isAvailable
                          ? (item.size ?? item.label)
                          : `${item.size ?? item.label}, ${messages.product.outOfStock}`
                      }
                      data-selected={selected ? 'true' : 'false'}
                      disabled={!item.isAvailable}
                      onClick={() => {
                        setVariantId(item.id);
                        setQuantity(1);
                      }}
                    >
                      {formatVariantSize(item.size, item.label)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

            <div className={styles.quantityRow}>
              <div className={styles.optionGroup}>
                <p className={styles.optionLabel}>{messages.product.quantity}</p>
                <QuantitySelector
                  value={quantity}
                  max={quantityMax}
                  onChange={changeQuantity}
                  className={styles.quantityWide}
                />
              </div>
            </div>
            {quantity >= quantityMax && quantityMax > 1 ? (
              <p className={styles.fixture}>{messages.product.quantityLimit}</p>
            ) : null}

            <div className={styles.actions}>
              <Button
                className={styles.cartButton}
                onClick={addToCart}
                disabled={!purchasable || cartBusy}
                fullWidth
              >
                {messages.actions.addToCart}
              </Button>
              <div className={styles.wishlistRow}>
                <WishlistButton
                  productId={product.id}
                  className={styles.wishlistInline}
                />
                <span>{messages.nav.wishlist}</span>
              </div>
            </div>
          </div>

          <ProductHighlights />
          {accordionItems.length > 0 ? (
            <div className={styles.details}>
              <Accordion items={accordionItems} />
            </div>
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
