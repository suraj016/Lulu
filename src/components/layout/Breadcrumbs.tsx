import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export type Crumb = {
  label: string;
  to?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Brødkrummer">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {item.to && !last ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span className={last ? styles.current : undefined} aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? <span className={styles.sep}> / </span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
