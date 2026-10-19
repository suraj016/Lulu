import { messages } from '../../data/messages.ts';
import { buildPageWindow } from '../../utils/pagination.ts';
import styles from './Pagination.module.css';

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const window = buildPageWindow(page, pageCount);

  return (
    <nav className={styles.nav} aria-label="Paginering">
      <button
        className={styles.button}
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {messages.actions.previous}
      </button>
      {window.pages.map((item, index) =>
        item === 'ellipsis' ? (
          <span className={styles.ellipsis} key={`e-${index}`}>
            …
          </span>
        ) : (
          <button
            className={styles.page}
            type="button"
            key={item}
            data-current={item === page ? 'true' : 'false'}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            <span className="visually-hidden">{messages.catalog.pageLabel} </span>
            {item}
          </button>
        ),
      )}
      <button
        className={styles.button}
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        {messages.actions.next}
      </button>
    </nav>
  );
}
