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
import styles from './ShopPage.module.css';

function collectionFromPath(slug?: string) {
  if (slug === '3d-produkter' || slug === 'sokker') {
    return getCollection(slug);
  }
  return undefined;
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
  const description =
    collection?.description ??
    'Alle 3D-produkter og sokker i denne prototype — et midlertidigt katalog til udvikling.';

  if (collectionSlug && !collection) {
    return <NotFoundPage />;
  }

  return (
    <div className="container">
      <div className={styles.intro}>
        <Breadcrumbs
          items={[
            { label: messages.nav.home, to: '/' },
            { label: messages.nav.shop, to: '/shop' },
            ...(collection ? [{ label: collection.name }] : []),
          ]}
        />
        <h1>{title}</h1>
        <p style={{ maxWidth: '40rem', marginTop: '0.75rem' }}>{description}</p>
        <div className={styles.banner}>
          <SafeImage
            src={
              collectionSlug === 'sokker'
                ? editorialAssets.socksCampaign.src
                : editorialAssets.catalogBanner.src
            }
            alt={
              collectionSlug === 'sokker'
                ? editorialAssets.socksCampaign.alt
                : editorialAssets.catalogBanner.alt
            }
          />
        </div>
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
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
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

      <section className={styles.lowerBanner}>
        <SafeImage
          src={editorialAssets.sustainabilityBanner.src}
          alt={editorialAssets.sustainabilityBanner.alt}
        />
        <div>
          <p className="eyebrow">Materialer</p>
          <h2>Printet med omtanke — uden store løfter, vi ikke kan dokumentere.</h2>
          <p style={{ margin: '0.85rem 0 1.2rem' }}>
            Flere 3D-produkter i kataloget er angivet som PLA. Det er en
            materialeangivelse i prototypen, ikke en miljøcertificering.
          </p>
          <Button to="/om-os">{messages.nav.about}</Button>
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
