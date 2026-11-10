import { messages } from '../../data/messages.ts';

export function RouteFallback() {
  return (
    <div className="container page-status">
      <p aria-live="polite">{messages.app.loadingPage}</p>
    </div>
  );
}
