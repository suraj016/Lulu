import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ShopifyStorefrontError,
  STOREFRONT_PRODUCTS_QUERY,
  storefrontEndpoint,
  storefrontRequest,
  type StorefrontConfig,
} from '../services/shopifyStorefront.ts';

const config: StorefrontConfig = {
  domain: 'example.myshopify.com',
  apiVersion: '2026-10',
  publicToken: 'public-storefront-token',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('shopifyStorefront', () => {
  it('builds the Storefront GraphQL endpoint from public config', () => {
    expect(storefrontEndpoint(config)).toBe(
      'https://example.myshopify.com/api/2026-10/graphql.json',
    );
  });

  it('throws a clear error for HTTP failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ errors: [{ message: 'Unavailable' }] }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(
      storefrontRequest(STOREFRONT_PRODUCTS_QUERY, { first: 1 }, config),
    ).rejects.toBeInstanceOf(ShopifyStorefrontError);
  });

  it('throws when GraphQL returns errors even if HTTP is 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ errors: [{ message: 'Access denied' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(
      storefrontRequest(STOREFRONT_PRODUCTS_QUERY, { first: 1 }, config),
    ).rejects.toThrow(/Access denied/);
  });

  it('sends the public token header and JSON body', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain('/api/2026-10/graphql.json');
      expect(init?.method).toBe('POST');
      const headers = new Headers(init?.headers);
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('X-Shopify-Storefront-Access-Token')).toBe(
        config.publicToken,
      );
      return new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(storefrontRequest<{ ok: boolean }>('query { shop { name } }', {}, config)).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
