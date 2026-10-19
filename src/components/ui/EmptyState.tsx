import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      {action}
    </div>
  );
}
