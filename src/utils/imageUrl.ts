export function shopifyImageUrl(src: string, width?: number): string {
  if (!width || width < 1) {
    return src;
  }

  try {
    const url = new URL(src, 'https://lulu3d.local');
    const host = url.hostname.toLocaleLowerCase('en-US');
    if (!host.includes('shopify.com') && !host.includes('shopifycdn.com')) {
      return src;
    }
    url.searchParams.set('width', String(Math.round(width)));
    url.searchParams.delete('height');
    return url.toString();
  } catch {
    return src;
  }
}
