import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '../../components/ui/Button.tsx';
import { messages } from '../../data/messages.ts';
import { loadProductCatalog } from '../../services/productService.ts';
import { ShopifyStorefrontError } from '../../services/shopifyStorefront.ts';

type GateStatus = 'loading' | 'ready' | 'error';

type CatalogStatusValue = {
  status: GateStatus;
  message: string;
  retry: () => void;
};

const CatalogStatusContext = createContext<CatalogStatusValue>({
  status: 'loading',
  message: '',
  retry: () => undefined,
});

function errorMessage(error: unknown): string {
  if (error instanceof ShopifyStorefrontError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return messages.catalog.loadErrorUnknown;
}

export function useCatalogStatus(): CatalogStatusValue {
  return useContext(CatalogStatusContext);
}

export function CatalogStatusScreen({
  status,
  message,
  retry,
}: CatalogStatusValue) {
  return (
    <div className="container page-status catalog-status">
      {status === 'loading' ? (
        <p aria-live="polite">{messages.catalog.loading}</p>
      ) : (
        <>
          <h1>{messages.catalog.loadErrorTitle}</h1>
          <p className="catalog-status-body">{message}</p>
          <p className="catalog-status-hint">{messages.catalog.loadErrorBody}</p>
          <Button onClick={retry}>{messages.catalog.loadErrorRetry}</Button>
        </>
      )}
    </div>
  );
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GateStatus>('loading');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadProductCatalog()
      .then(() => {
        if (!cancelled) {
          setStatus('ready');
          setMessage('');
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setStatus('error');
        setMessage(errorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const value = useMemo(
    () => ({
      status,
      message,
      retry: () => {
        setStatus('loading');
        setMessage('');
        setAttempt((current) => current + 1);
      },
    }),
    [status, message],
  );

  return (
    <CatalogStatusContext.Provider value={value}>
      {children}
    </CatalogStatusContext.Provider>
  );
}

export function CatalogReadyLayout() {
  const catalog = useCatalogStatus();
  if (catalog.status === 'ready') {
    return <Outlet />;
  }
  return <CatalogStatusScreen {...catalog} />;
}
