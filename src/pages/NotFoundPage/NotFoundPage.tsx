import { Button } from '../../components/ui/Button.tsx';
import { messages } from '../../data/messages.ts';

export function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '5rem 0', maxWidth: '32rem' }}>
      <p className="eyebrow">404</p>
      <h1>{messages.notFound.title}</h1>
      <p style={{ margin: '0.9rem 0 1.4rem' }}>{messages.notFound.body}</p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button to="/">{messages.nav.home}</Button>
        <Button to="/shop" variant="secondary">
          {messages.nav.shop}
        </Button>
      </div>
    </div>
  );
}
