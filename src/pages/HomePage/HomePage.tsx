import { editorialAssets } from '../../assets/manifest.ts';
import { TrustStrip } from '../../components/layout/TrustStrip.tsx';
import { ProductGrid } from '../../components/products/ProductGrid.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { SafeImage } from '../../components/ui/SafeImage.tsx';
import { messages } from '../../data/messages.ts';
import { homeBenefits } from '../../data/mockContent.ts';
import {
  getFeaturedProducts,
  getNewArrivals,
} from '../../services/productService.ts';
import styles from './HomePage.module.css';

export function HomePage() {
  const featured = getFeaturedProducts();
  const arrivals = getNewArrivals();

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
                <Button to="/shop/3d-produkter" variant="ink">
                  {messages.actions.shopNow}
                  <span aria-hidden="true">→</span>
                </Button>
                <Button to="/shop" variant="secondary" className={styles.outline}>
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
            <Button to="/shop/3d-produkter" variant="ghost">
              {messages.actions.seeAll3d}
            </Button>
          </div>
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="container">
        <div className={styles.socks}>
          <div>
            <p className="eyebrow">Sokker</p>
            <h2>{messages.home.socksTitle}</h2>
            <p style={{ margin: '1rem 0 1.4rem' }}>{messages.home.socksBody}</p>
            <div className={styles.actions}>
              <Button to="/shop/sokker">{messages.actions.shopSocks}</Button>
              <Button to="/shop/sokker" variant="secondary">
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
            <Button to="/shop/sokker" variant="ghost">
              {messages.actions.seeAllSocks}
            </Button>
          </div>
          <ProductGrid products={arrivals} />
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
            <h2>{messages.home.benefitsTitle}</h2>
            {homeBenefits.map((item) => (
              <div key={item.id}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>
                  {item.title}
                </h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
