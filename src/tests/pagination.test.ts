import { describe, expect, it } from 'vitest';
import { buildPageWindow, paginate } from '../utils/pagination.ts';

describe('pagination', () => {
  it('slices the current page and clamps overflow', () => {
    const items = Array.from({ length: 25 }, (_, index) => index + 1);
    const first = paginate(items, 1, 12);
    expect(first.items).toEqual(items.slice(0, 12));
    expect(first.pageCount).toBe(3);
    const overflow = paginate(items, 99, 12);
    expect(overflow.page).toBe(3);
  });

  it('builds ellipsis windows for large page counts', () => {
    const window = buildPageWindow(5, 12);
    expect(window.pages[0]).toBe(1);
    expect(window.pages).toContain('ellipsis');
    expect(window.pages.at(-1)).toBe(12);
  });
});
