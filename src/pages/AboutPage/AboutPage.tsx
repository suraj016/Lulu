import { Leaf, MapPin, Sparkles } from 'lucide-react';
import { editorialAssets } from '../../assets/manifest.ts';
import { Button } from '../../components/ui/Button.tsx';
import { SafeImage } from '../../components/ui/SafeImage.tsx';
import { messages } from '../../data/messages.ts';
import { aboutValues, processSteps } from '../../data/mockContent.ts';
import styles from './AboutPage.module.css';

const icons = {
  pin: MapPin,
  spark: Sparkles,
  leaf: Leaf,
  dot: Sparkles,
};

export function AboutPage() {
  return (
    <div className="container">
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className="eyebrow">{messages.about.eyebrow}</p>
          <h1>{messages.about.heading}</h1>
          <p>{messages.about.intro}</p>
          <Button to="/om-os#vaerdier">{messages.actions.ourValues}</Button>
        </div>
        <div className={styles.blob}>
          <SafeImage
            src={editorialAssets.aboutHero.src}
            alt={editorialAssets.aboutHero.alt}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </section>

      <section className={styles.values} id="vaerdier">
        {aboutValues.map((item) => {
          const Icon = icons[item.icon];
          return (
            <div className={styles.value} key={item.id}>
              <Icon size={20} color="var(--color-forest)" aria-hidden="true" />
              <p>{item.label}</p>
            </div>
          );
        })}
      </section>

      <section className={styles.process}>
        <h2>{messages.about.processTitle}</h2>
        <div className={styles.steps}>
          {processSteps.map((step, index) => (
            <article className={styles.step} key={step.id}>
              <SafeImage
                src={step.image.src}
                alt={step.image.alt}
                width={step.image.width}
                height={step.image.height}
              />
              <p className="eyebrow">0{index + 1}</p>
              <h3 style={{ fontSize: '1.25rem', margin: '0.35rem 0' }}>
                {step.title}
              </h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.unique}>
        <div className={styles.uniqueMedia}>
          <SafeImage
            src={editorialAssets.aboutUniqueness.src}
            alt={editorialAssets.aboutUniqueness.alt}
          />
        </div>
        <div>
          <h2>{messages.about.uniquenessTitle}</h2>
          <p style={{ marginTop: '0.9rem' }}>{messages.about.uniquenessBody}</p>
        </div>
      </section>

      <section className={styles.banner}>
        <SafeImage
          src={editorialAssets.aboutBanner.src}
          alt={editorialAssets.aboutBanner.alt}
        />
        <div>
          <h2>{messages.about.bannerTitle}</h2>
          <div style={{ marginTop: '1.1rem' }}>
            <Button to="/shop">{messages.actions.shopNow}</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
