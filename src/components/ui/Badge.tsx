import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Tone = 'forest' | 'sale' | 'soft';

export function Badge({
  children,
  tone = 'forest',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
