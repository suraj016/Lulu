import { Heart, Leaf, MapPin, Sparkles, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  homeTrustItems,
  productBenefitItems,
  trustItems,
} from '../../data/mockContent.ts';
import styles from './TrustStrip.module.css';

const icons: Record<string, LucideIcon> = {
  leaf: Leaf,
  spark: Sparkles,
  truck: Truck,
  pin: MapPin,
  heart: Heart,
  dot: Sparkles,
};

function DenmarkFlag() {
  return (
    <svg
      className={styles.flag}
      viewBox="0 0 16 12"
      width="20"
      height="15"
      aria-hidden="true"
    >
      <rect width="16" height="12" rx="1" fill="#c8102e" />
      <rect x="5" width="2.3" height="12" fill="#fff" />
      <rect y="4.85" width="16" height="2.3" fill="#fff" />
    </svg>
  );
}

function TrustIcon({ name }: { name: string }) {
  if (name === 'flag') {
    return <DenmarkFlag />;
  }
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={styles.icon} size={18} aria-hidden="true" />;
}

type TrustStripProps = {
  variant?: 'store' | 'product' | 'home';
};

export function TrustStrip({ variant = 'store' }: TrustStripProps) {
  if (variant === 'home') {
    return (
      <ul className={`${styles.strip} ${styles.detailed}`}>
        {homeTrustItems.map((item) => (
          <li className={styles.detailedItem} key={item.id}>
            <TrustIcon name={item.icon} />
            <span>
              <strong>{item.label}</strong>
              <span className={styles.detail}>{item.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }

  const items = variant === 'product' ? productBenefitItems : trustItems;

  return (
    <ul className={styles.strip}>
      {items.map((item) => (
        <li className={styles.item} key={item.id}>
          <TrustIcon name={item.icon} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
