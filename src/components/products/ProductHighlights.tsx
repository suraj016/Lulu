import { Leaf, Shirt, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import styles from './ProductHighlights.module.css';

const items: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'eco', label: messages.product.highlightEco, icon: Leaf },
  { id: 'shipping', label: messages.product.highlightShipping, icon: Truck },
  { id: 'care', label: messages.product.highlightCare, icon: Shirt },
];

export function ProductHighlights() {
  return (
    <section className={styles.highlights} aria-label={messages.product.highlightsTitle}>
      <h2 className={styles.title}>{messages.product.highlightsTitle}</h2>
      <ul className={styles.list}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li className={styles.item} key={item.id}>
              <span className={styles.iconWell} aria-hidden="true">
                <Icon size={22} strokeWidth={1.65} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}