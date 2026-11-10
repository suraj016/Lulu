import { Button } from '../../components/ui/Button.tsx';
import { messages } from '../../data/messages.ts';
import { pageTitle, usePageMeta } from '../../seo/usePageMeta.ts';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  usePageMeta({
    title: pageTitle(messages.notFound.title),
    description: messages.notFound.body,
    robots: 'noindex',
  });

  return (
    <div className={`container ${styles.page}`}>
      <p className="eyebrow">404</p>
      <h1>{messages.notFound.title}</h1>
      <p className={styles.body}>{messages.notFound.body}</p>
      <div className={styles.actions}>
        <Button to="/">{messages.nav.home}</Button>
        <Button to="/shop" variant="secondary">
          {messages.nav.shop}
        </Button>
      </div>
    </div>
  );
}
