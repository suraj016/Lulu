import { Gift, Globe, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { editorialAssets } from '../../assets/manifest.ts';
import { TrustStrip } from '../../components/layout/TrustStrip.tsx';
import {
  ProductGrid,
  ProductGridSkeleton,
} from '../../components/products/ProductGrid.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { SafeImage } from '../../components/ui/SafeImage.tsx';
import { messages } from '../../data/messages.ts';
import { homeBenefits } from '../../data/mockContent.ts';
import { prefetchPath } from '../../app/lazyRoutes.ts';
import { useCatalogStatus } from '../../app/providers/CatalogGate.tsx';
import {
  getFeaturedProducts,
  getNewArrivals,
} from '../../services/productService.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import styles from './HomePage.module.css';

const homeBenefitIcons: Record<(typeof homeBenefits)[number]['icon'], LucideIcon> = {
  leaf: Leaf,
  globe: Globe,
  gift: Gift,
};

function shopLink(to: string) {
  return {
    to,
    onPointerEnter: () => prefetchPath(to),
    onFocus: () => prefetchPath(to),
  };
}

export function HomePage() {
  const catalog = useCatalogStatus();
  const featured = catalog.status === 'ready' ? getFeaturedProducts() : [];
  const arrivals = catalog.status === 'ready' ? getNewArrivals() : [];
  usePageMeta({
    title: pageTitle(),
    description: messages.seo.defaultDescription,
    path: '/',
    image: editorialAssets.heroHome.src,
  });

  return (
    <>
      <section className={styles.heroSection}>
        <div className={styles.hero}>
          <div className={styles.heroImage}>
            <SafeImage
              src={editorialAssets.heroHome.src}
              alt={editorialAssets.heroHome.alt}
              width={editorialAssets.heroHome.width}
              height={editorialAssets.heroHome.height}
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className={styles.heroPanel}>
            <div className={styles.copy}>
              <p className="eyebrow">{messages.home.heroEyebrow}</p>
              <h1>
                {messages.home.heroTitleLead}{' '}
                <span className="accent">{messages.home.heroTitleRest}</span>
              </h1>
              <p>{messages.home.heroBody}</p>
              <div className={styles.actions}>
                <Button {...shopLink('/shop')} variant="ink">
                  {messages.actions.shopNow}
                  <span aria-hidden="true">→</span>
                </Button>
                <Button
                  {...shopLink('/shop')}
                  variant="secondary"
                  className={styles.outline}
                >
                  {messages.actions.seeAllProducts}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={`container ${styles.trust}`}>
          <TrustStrip variant="home" />
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>{messages.home.popularTitle}</h2>
            <Button {...shopLink('/shop/popular-3d')} variant="ghost">
              {messages.actions.seeAll3d}
            </Button>
          </div>
          {catalog.status === 'ready' ? (
            <ProductGrid products={featured} />
          ) : (
            <ProductGridSkeleton />
          )}
        </div>
      </section>

      <section className="container">
        <div className={styles.socks}>
          <div>
            <p className="eyebrow">Sokker</p>
            <h2>{messages.home.socksTitle}</h2>
            <p className={styles.socksBody}>{messages.home.socksBody}</p>
            <div className={styles.actions}>
              <Button {...shopLink('/shop')}>{messages.actions.shopSocks}</Button>
              <Button {...shopLink('/shop')} variant="secondary">
                {messages.actions.seeAllSocks}
              </Button>
            </div>
          </div>
          <div className={styles.socksMedia}>
            <SafeImage
              src={editorialAssets.socksCampaign.src}
              alt={editorialAssets.socksCampaign.alt}
              width={editorialAssets.socksCampaign.width}
              height={editorialAssets.socksCampaign.height}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>{messages.home.newArrivalsTitle}</h2>
            <Button {...shopLink('/shop/new-arrivals')} variant="ghost">
              {messages.actions.seeAllSocks}
            </Button>
          </div>
          {catalog.status === 'ready' ? (
            <ProductGrid products={arrivals} />
          ) : (
            <ProductGridSkeleton />
          )}
        </div>
      </section>

      <section className="container">
        <div className={styles.benefits}>
          <div className={styles.benefitsMedia}>
            <SafeImage
              src={editorialAssets.brandBenefits.src}
              alt={editorialAssets.brandBenefits.alt}
              width={editorialAssets.brandBenefits.width}
              height={editorialAssets.brandBenefits.height}
            />
          </div>
          <div className={styles.benefitsList}>
            {homeBenefits.map((item) => {
              const Icon = homeBenefitIcons[item.icon];
              return (
                <div key={item.id} className={styles.benefitItem}>
                  <div className={styles.benefitIcon} aria-hidden="true">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <div className={styles.benefitCopy}>
                    <h3 className={styles.benefitTitle}>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
