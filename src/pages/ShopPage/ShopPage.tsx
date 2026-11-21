import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NotFoundPage } from '../NotFoundPage/NotFoundPage.tsx';
import { SlidersHorizontal } from 'lucide-react';
import { editorialAssets } from '../../assets/manifest.ts';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs.tsx';
import { TrustStrip } from '../../components/layout/TrustStrip.tsx';
import { Pagination } from '../../components/products/Pagination.tsx';
import { ProductFilters } from '../../components/products/ProductFilters.tsx';
import { ProductGrid } from '../../components/products/ProductGrid.tsx';
import { ProductSort } from '../../components/products/ProductSort.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Drawer } from '../../components/ui/Drawer.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { SafeImage } from '../../components/ui/SafeImage.tsx';
import { messages } from '../../data/messages.ts';
import { ProductType, SortKey, type CatalogQuery } from '../../types/product.ts';
import {
  catalogQueryFromSearch,
  catalogQueryToSearch,
  countActiveFilters,
} from '../../utils/catalogUrl.ts';
import {
  getCollection,
  getPriceBounds,
  getProducts,
} from '../../services/productService.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import styles from './ShopPage.module.css';

function collectionFromPath(slug?: string) {
  if (!slug) {
    return undefined;
  }
  return getCollection(slug);
}

function ShopHeroTitle({ title }: { title: string }) {
  if (title === '3D-produkter') {
    return (
      <h1 className={styles.shopHeroTitle}>
        3D-<span className="accent">produkter</span>
      </h1>
    );
  }
  if (title === messages.nav.shop) {
    return (
      <h1 className={styles.shopHeroTitle}>
        <span className="accent">Shop</span>
      </h1>
    );
  }
  return <h1 className={styles.shopHeroTitle}>{title}</h1>;
}

export function ShopPage() {
  const { collectionSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const bounds = getPriceBounds();
  const collection = collectionFromPath(collectionSlug);

  const defaults = useMemo<Partial<CatalogQuery>>(() => {
    if (collectionSlug === '3d-produkter') {
      return {
        collectionId: '3d-produkter',
        productType: ProductType.Printed3d,
        sort: SortKey.Popular,
        pageSize: 12,
      };
    }
    if (collectionSlug === 'sokker') {
      return {
        collectionId: 'sokker',
        productType: ProductType.Socks,
        sort: SortKey.Popular,
        pageSize: 12,
      };
    }
    if (collectionSlug) {
      return {
        collectionId: collectionSlug,
        sort: SortKey.Popular,
        pageSize: 12,
      };
    }
    return { sort: SortKey.Popular, pageSize: 12 };
  }, [collectionSlug]);

  const query = useMemo(
    () => catalogQueryFromSearch(location.search, defaults),
    [location.search, defaults],
  );

  const result = getProducts(query);
  const active = countActiveFilters(query);

  const updateQuery = (next: CatalogQuery) => {
    const search = catalogQueryToSearch(next);
    navigate({ pathname: location.pathname, search }, { replace: false });
  };

  const title = collection?.name ?? messages.nav.shop;
  const description = collection?.description ?? messages.catalog.allProductsBody;
  const heroBannerSrc =
    collectionSlug === 'sokker'
      ? editorialAssets.socksCampaign.src
      : editorialAssets.catalogBanner.src;
  const heroBannerAlt =
    collectionSlug === 'sokker'
      ? editorialAssets.socksCampaign.alt
      : editorialAssets.catalogBanner.alt;
  usePageMeta({
    title: pageTitle(title),
    description,
    path: location.pathname,
    robots: collectionSlug && !collection ? 'noindex' : undefined,
  });

  if (collectionSlug && !collection) {
    return <NotFoundPage />;
  }

  return (
    <div className="container">
      <div className={styles.intro}>
        <section className={styles.shopHero}>
          <SafeImage
            className={styles.shopHeroImage}
            src={heroBannerSrc}
            alt={heroBannerAlt}
            width={editorialAssets.catalogBanner.width}
            height={editorialAssets.catalogBanner.height}
            loading="eager"
            sizes="100vw"
          />
          <div className={styles.shopHeroPanel}>
            <Breadcrumbs
              items={[
                { label: messages.nav.home, to: '/' },
                { label: messages.nav.shop, to: '/shop' },
                ...(collection ? [{ label: collection.name }] : []),
              ]}
            />
            <ShopHeroTitle title={title} />
            <p className={styles.shopHeroDa}>{description}</p>
          </div>
        </section>
        <TrustStrip />
      </div>

      <div className={styles.layout}>
        <aside className={styles.desktopFilters}>
          <ProductFilters query={query} bounds={bounds} onChange={updateQuery} />
        </aside>
        <div>
          <div className={styles.toolbar}>
            <p>
              {messages.catalog.resultCount(result.total)}
              {active > 0 ? ` · ${active} ${messages.catalog.activeFilters.toLowerCase()}` : ''}
            </p>
            <div className={styles.toolbarActions}>
              <Button
                className={styles.mobileFilters}
                variant="secondary"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} />
                {messages.actions.openFilters}
              </Button>
              <ProductSort
                value={query.sort}
                onChange={(sort) => updateQuery({ ...query, sort, page: 1 })}
              />
            </div>
          </div>
          {result.items.length === 0 ? (
            <EmptyState
              title={messages.catalog.empty}
              body={messages.catalog.emptyHint}
              action={
                <Button
                  variant="ghost"
                  onClick={() =>
                    updateQuery({
                      ...query,
                      categoryId: undefined,
                      minPriceOre: undefined,
                      maxPriceOre: undefined,
                      colors: [],
                      materials: [],
                      isNew: undefined,
                      inStock: undefined,
                      page: 1,
                    })
                  }
                >
                  {messages.actions.resetFilters}
                </Button>
              }
            />
          ) : (
            <ProductGrid products={result.items} />
          )}
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            onPageChange={(page) => updateQuery({ ...query, page })}
          />
        </div>
      </div>

      <section className={styles.shopLower}>
        <SafeImage
          className={styles.shopLowerImage}
          src={editorialAssets.sustainabilityBanner.src}
          alt={editorialAssets.sustainabilityBanner.alt}
          width={editorialAssets.sustainabilityBanner.width}
          height={editorialAssets.sustainabilityBanner.height}
          loading="lazy"
          sizes="(min-width: 960px) 90vw, 100vw"
        />
        <div className={styles.shopLowerPanel}>
          <h2 className={styles.shopLowerTitle}>{messages.catalog.materialsTitle}</h2>
          <p className={styles.shopLowerBody}>{messages.catalog.materialsBody}</p>
        </div>
      </section>

      <Drawer
        open={filtersOpen}
        title={messages.catalog.filters}
        onClose={() => setFiltersOpen(false)}
        side="left"
      >
        <ProductFilters query={query} bounds={bounds} onChange={updateQuery} />
      </Drawer>
    </div>
  );
}
