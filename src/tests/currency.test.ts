import { describe, expect, it } from 'vitest';
import { CurrencyCode } from '../types/product.ts';
import { formatMoney, oreFromKroner } from '../utils/currency.ts';

describe('currency', () => {
  it('formats whole DKK amounts in Danish style', () => {
    expect(formatMoney(oreFromKroner(149))).toBe('149 kr.');
    expect(formatMoney(oreFromKroner(99))).toBe('99 kr.');
    expect(formatMoney(oreFromKroner(1079))).toBe('1.079 kr.');
  });

  it('keeps DKK as the default currency', () => {
    expect(formatMoney(7900, CurrencyCode.Dkk)).toContain('kr.');
  });
});
