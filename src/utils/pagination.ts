export type PageWindow = {
  pages: Array<number | 'ellipsis'>;
  page: number;
  pageCount: number;
};

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; page: number; pageCount: number; total: number } {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total,
  };
}

export function buildPageWindow(
  page: number,
  pageCount: number,
  siblingCount = 1,
): PageWindow {
  if (pageCount <= 7) {
    return {
      pages: Array.from({ length: pageCount }, (_, index) => index + 1),
      page,
      pageCount,
    };
  }

  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, page - siblingCount);
  const end = Math.min(pageCount - 1, page + siblingCount);

  if (start > 2) {
    pages.push('ellipsis');
  }

  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  if (end < pageCount - 1) {
    pages.push('ellipsis');
  }

  pages.push(pageCount);

  return { pages, page, pageCount };
}
