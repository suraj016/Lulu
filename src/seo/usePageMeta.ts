import { useEffect } from 'react';
import { messages } from '../data/messages.ts';

export type PageMeta = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: string;
};

export function pageTitle(page?: string): string {
  if (!page) {
    return messages.seo.defaultTitle;
  }
  return `${page} | ${messages.brand}`;
}

export function truncateMeta(text: string, max = 160): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, max - 1).trimEnd()}…`;
}

function upsertMeta(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
}

function upsertLink(rel: string, href: string): void {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function canonicalUrl(path = '/'): string {
  const origin = window.location.origin.replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized === '/' ? '/' : normalized.replace(/\/+$/, '')}`;
}

export function applyPageMeta(meta: PageMeta): void {
  const title = meta.title.trim() || messages.seo.defaultTitle;
  const description =
    truncateMeta(meta.description) || messages.seo.defaultDescription;
  const url = canonicalUrl(meta.path ?? window.location.pathname);

  document.title = title;
  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: description,
  });
  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: title,
  });
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  });
  upsertMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: url,
  });
  upsertMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: 'website',
  });
  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary_large_image',
  });
  upsertLink('canonical', url);

  if (meta.image) {
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: new URL(meta.image, window.location.origin).toString(),
    });
  }

  if (meta.robots) {
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: meta.robots,
    });
  } else {
    document.head.querySelector('meta[name="robots"]')?.remove();
  }
}

export function usePageMeta(meta: PageMeta): void {
  const { title, description, path, image, robots } = meta;
  useEffect(() => {
    applyPageMeta({ title, description, path, image, robots });
  }, [title, description, path, image, robots]);
}
