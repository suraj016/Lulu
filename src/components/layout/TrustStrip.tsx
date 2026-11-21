import {
  homeTrustItems,
  productBenefitItems,
  trustItems,
} from '../../data/mockContent.ts';
import {
  resolveTrustArtId,
  TrustStripArt,
} from './TrustStripArt.tsx';
import styles from './TrustStrip.module.css';

type TrustStripProps = {
  variant?: 'store' | 'product' | 'home';
};

export function TrustStrip({ variant = 'store' }: TrustStripProps) {
  if (variant === 'home') {
    return (
      <ul className={`${styles.strip} ${styles.homeStrip}`}>
        {homeTrustItems.map((item) => (
          <li className={styles.homeItem} key={item.id}>
            <div className={styles.stripIconWell}>
              <TrustStripArt id={resolveTrustArtId(item.id)} />
            </div>
            <div className={styles.homeCopy}>
              <strong className={styles.homeTitle}>{item.label}</strong>
              <span className={styles.homeDetail}>{item.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const items = variant === 'product' ? productBenefitItems : trustItems;
  const compactClass =
    variant === 'product'
      ? `${styles.compactStrip} ${styles.productStrip}`
      : styles.compactStrip;

  return (
    <ul className={`${styles.strip} ${compactClass}`}>
      {items.map((item) => (
        <li className={styles.compactItem} key={item.id}>
          <div className={styles.stripIconWell}>
            <TrustStripArt id={resolveTrustArtId(item.id)} />
          </div>
          <span className={styles.compactLabel}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}