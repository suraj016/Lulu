import { describe, expect, it } from 'vitest';
import { pageTitle, truncateMeta } from '../seo/usePageMeta.ts';
import { shopifyImageUrl } from '../utils/imageUrl.ts';

describe('page metadata helpers', () => {
  it('builds titles with the brand suffix', () => {
    expect(pageTitle('Nyheder')).toBe('Nyheder | Lulu3D');
    expect(pageTitle()).toContain('Lulu3D');
  });

  it('truncates meta descriptions without splitting the last word harshly', () => {
    const long = 'A'.repeat(200);
    expect(truncateMeta(long, 160).length).toBeLessThanOrEqual(160);
    expect(truncateMeta('Korte sokker', 160)).toBe('Korte sokker');
  });
});

describe('Shopify image URLs', () => {
  it('adds a width parameter only for Shopify CDN images', () => {
    const shopify =
      'https://cdn.shopify.com/s/files/1/0000/0001/products/pink.jpg?v=12';
    expect(shopifyImageUrl(shopify, 640)).toContain('width=640');
    expect(
      shopifyImageUrl('/placeholders/products/fallback.svg', 640),
    ).toBe('/placeholders/products/fallback.svg');
  });
});
