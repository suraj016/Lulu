import {
  ArrowDown,
  ArrowRight,
  Package,
  PenLine,
  Printer,
  Sparkles,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Fragment } from 'react';
import { editorialAssets } from '../../assets/manifest.ts';
import { Button } from '../../components/ui/Button.tsx';
import { SafeImage } from '../../components/ui/SafeImage.tsx';
import { messages } from '../../data/messages.ts';
import { aboutValues, processSteps } from '../../data/mockContent.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import { AboutValueArt } from './AboutValueArt.tsx';
import styles from './AboutPage.module.css';

const processStepIcons: Record<(typeof processSteps)[number]['id'], LucideIcon> = {
  design: PenLine,
  print: Printer,
  pack: Package,
  ship: Truck,
};

export function AboutPage() {
  usePageMeta({
    title: pageTitle(messages.nav.about),
    description: messages.about.intro,
    path: '/om-os',
  });

  const scrollToValues = () => {
    document.getElementById('vaerdier')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="container">
      <section className={styles.aboutHero} aria-labelledby="about-hero-heading">
        <SafeImage
          className={styles.aboutHeroImage}
          src={editorialAssets.aboutHero.src}
          alt={editorialAssets.aboutHero.alt}
          width={editorialAssets.aboutHero.width}
          height={editorialAssets.aboutHero.height}
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className={styles.aboutHeroPanel}>
          <p className={styles.aboutHeroEyebrow}>{messages.about.eyebrow}</p>
          <h1 className={styles.aboutHeroTitle} id="about-hero-heading">
            <span className={styles.aboutHeroTitleLead}>{messages.about.headingLead}</span>
            <span className={styles.aboutHeroTitleAccent}>{messages.about.headingAccent}</span>
          </h1>
          <p className={styles.aboutHeroBody}>{messages.about.intro}</p>
          <Button
            className={styles.aboutHeroButton}
            to="/om-os#vaerdier"
            onClick={scrollToValues}
          >
            {messages.actions.ourValues}
            <ArrowRight size={18} strokeWidth={2.1} aria-hidden="true" />
          </Button>
        </div>
      </section>

      <ul className={styles.values} id="vaerdier" aria-label={messages.about.valuesSection}>
        {aboutValues.map((item) => (
          <li className={styles.value} key={item.id}>
            <span className={styles.valueIcon}>
              <AboutValueArt id={item.icon} />
            </span>
            <p className={styles.valueLabel}>{item.label}</p>
          </li>
        ))}
      </ul>

      <section className={styles.process}>
        <h2>{messages.about.processTitle}</h2>
        <div className={styles.processFlow}>
          <div className={styles.processVisual}>
            {processSteps.map((step, index) => (
              <Fragment key={step.id}>
                <div
                  className={`${styles.stepMedia} ${styles[`stepMedia_${step.id}`]}`}
                >
                  <SafeImage
                    src={step.image.src}
                    alt={step.image.alt}
                    width={step.image.width}
                    height={step.image.height}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className={styles.stepPhoto}
                    sizes="(min-width: 800px) 14vw, 72vw"
                  />
                </div>
                {index < processSteps.length - 1 ? (
                  <span className={styles.stepArrow} aria-hidden="true">
                    <ArrowRight
                      className={styles.stepArrowDesktop}
                      size={20}
                      strokeWidth={1.75}
                    />
                    <ArrowDown
                      className={styles.stepArrowMobile}
                      size={20}
                      strokeWidth={1.75}
                    />
                  </span>
                ) : null}
              </Fragment>
            ))}
          </div>
          <div className={styles.stepCaptions}>
            {processSteps.map((step) => {
              const StepIcon = processStepIcons[step.id];
              return (
                <article
                  className={`${styles.step} ${styles[`step_${step.id}`]}`}
                  key={step.id}
                >
                  <div className={styles.stepCopy}>
                    <span className={styles.stepLead} aria-hidden="true" />
                    <div className={styles.stepHeader}>
                      <StepIcon
                        className={styles.stepGlyph}
                        size={20}
                        strokeWidth={1.85}
                        aria-hidden="true"
                      />
                      <h3 className={styles.stepTitle}>{step.title}</h3>
                    </div>
                    <p className={styles.stepBody}>{step.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.uniqueBanner} aria-labelledby="about-unique-heading">
        <SafeImage
          className={styles.uniqueBannerImage}
          src={editorialAssets.aboutUniqueness.src}
          alt={editorialAssets.aboutUniqueness.alt}
          width={editorialAssets.aboutUniqueness.width}
          height={editorialAssets.aboutUniqueness.height}
          loading="lazy"
          sizes="(min-width: 960px) 90vw, 100vw"
        />
        <div className={styles.uniqueBannerPanel}>
          <p className={styles.uniqueBannerEyebrow}>{messages.about.uniquenessEyebrow}</p>
          <h2 className={styles.uniqueBannerTitle} id="about-unique-heading">
            {messages.about.uniquenessTitleLead}{' '}
            <span className="accent">{messages.about.uniquenessTitleAccent}</span>
          </h2>
          <p className={styles.uniqueBannerBody}>{messages.about.uniquenessBody}</p>
        </div>
      </section>

      <section className={styles.ctaBanner} aria-labelledby="about-cta-heading">
        <SafeImage
          className={styles.ctaBannerImage}
          src={editorialAssets.aboutBanner.src}
          alt={editorialAssets.aboutBanner.alt}
          width={editorialAssets.aboutBanner.width}
          height={editorialAssets.aboutBanner.height}
          loading="lazy"
          sizes="(min-width: 960px) 90vw, 100vw"
        />
        <div className={styles.ctaBannerPanel}>
          <p className={styles.ctaBannerEyebrow}>{messages.about.bannerEyebrow}</p>
          <h2 className={styles.ctaBannerTitle} id="about-cta-heading">
            <span className={styles.ctaBannerTitleLead}>
              {messages.about.bannerTitleLead}
            </span>
            <span className={styles.ctaBannerTitleAccent}>
              {messages.about.bannerTitleAccent}
            </span>
          </h2>
          <Button className={styles.ctaBannerButton} to="/shop">
            {messages.actions.shopNow}
            <ArrowRight size={18} strokeWidth={2.1} aria-hidden="true" />
          </Button>
        </div>
      </section>
    </div>
  );
}
