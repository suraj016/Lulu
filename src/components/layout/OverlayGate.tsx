import { Suspense, useState, type ReactNode } from 'react';
import { messages } from '../../data/messages.ts';

export function OverlayGate({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [keepMounted, setKeepMounted] = useState(false);
  if (open && !keepMounted) {
    setKeepMounted(true);
  }

  if (!keepMounted) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <p className="visually-hidden" aria-live="polite">
          {messages.app.loadingPage}
        </p>
      }
    >
      {children}
    </Suspense>
  );
}
