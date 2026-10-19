import { Link } from 'react-router-dom';
import { brandAssets } from '../../assets/manifest.ts';
import { footerNavigation, socialLinks } from '../../data/mockNavigation.ts';
import { messages } from '../../data/messages.ts';
import styles from './Footer.module.css';

export function Footer() {
  const visibleSocial = socialLinks.filter((item) => item.href);

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <Link to="/" aria-label={messages.brand}>
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
            {footerNavigation.map((item) => (
              <Link key={item.id} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={styles.bottom}>
          <p>{messages.footer.copyright}</p>
          {visibleSocial.length > 0 ? (
            <div className={styles.social}>
              {visibleSocial.map((item) => (
                <a key={item.id} href={item.href} rel="noreferrer" target="_blank">
                  {item.label}
                </a>
              ))}
            </div>
          ) : (
            <p>{messages.footer.legalNote}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
