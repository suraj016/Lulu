import { CurrencyCode } from '../types/product.ts';

const DEFAULT_CURRENCY: CurrencyCode = CurrencyCode.Dkk;

export function oreFromKroner(kroner: number): number {
  return Math.round(kroner * 100);
}

export function kronerFromOre(ore: number): number {
  return Math.round(ore) / 100;
}

export function formatMoney(
  ore: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  if (currency !== CurrencyCode.Dkk) {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency,
    }).format(kronerFromOre(ore));
  }

  const kroner = Math.round(ore / 100);
  return `${new Intl.NumberFormat('da-DK').format(kroner)} kr.`;
}
