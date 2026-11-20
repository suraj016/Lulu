import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { prefetchPath } from '../../app/lazyRoutes.ts';
import { brandAssets } from '../../assets/manifest.ts';
import { footerPrimaryLinks, socialLinks } from '../../data/mockNavigation.ts';
import { messages } from '../../data/messages.ts';
import styles from './Footer.module.css';

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.5 8.25H16V5h-2.9c-2.72 0-4.35 1.64-4.35 4.04V12H7v3.25h1.75V22H12v-6.75h2.58l.42-3.25H12v-2.5c0-.68.12-1.05 1.05-1.05Z"
      />
    </svg>
  );
}

const socialIcons: Record<(typeof socialLinks)[number]['id'], ReactNode> = {
  instagram: <InstagramGlyph />,
  facebook: <FacebookGlyph />,
};

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logoLink} aria-label={messages.brand}>
              <img
                className={styles.logo}
                src={brandAssets.logo.src}
                alt={brandAssets.logo.alt}
                width={brandAssets.logo.width}
                height={brandAssets.logo.height}
              />
            </Link>
            <p className={styles.blurb}>{messages.footer.blurb}</p>
          </div>

          <nav className={styles.nav} aria-label="Sidefod">
            {footerPrimaryLinks.map((item, index) => (
              <Fragment key={item.id}>
                {index > 0 ? (
                  <span className={styles.sep} aria-hidden="true">
                    |
                  </span>
                ) : null}
                <Link
                  to={item.to}
                  onPointerEnter={() => prefetchPath(item.to)}
                  onFocus={() => prefetchPath(item.to)}
                >
                  {item.label}
                </Link>
              </Fragment>
            ))}
          </nav>

          <div className={styles.social} aria-label="Sociale medier">
            {socialLinks.map((item) => {
              const glyph = socialIcons[item.id];
              const className = styles.socialLink;
              if (item.href) {
                return (
                  <a
                    key={item.id}
                    className={className}
                    href={item.href}
                    rel="noreferrer"
                    target="_blank"
                    aria-label={item.label}
                  >
                    {glyph}
                  </a>
                );
              }
              return (
                <span
                  key={item.id}
                  className={`${className} ${styles.socialPending}`}
                  aria-label={`${item.label} (kommer snart)`}
                >
                  {glyph}
                </span>
              );
            })}
          </div>
        </div>

        <p className={styles.copyright}>{messages.footer.copyright}</p>
      </div>
    </footer>
  );
}