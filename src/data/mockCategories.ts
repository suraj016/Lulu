import type { Category } from '../types/product.ts';

export const categories: Category[] = [
  {
    id: 'legetoj',
    slug: 'legetoj',
    name: 'Legetøj',
    description: 'Figurer, biler og små designs til leg.',
  },
  {
    id: 'bolig',
    slug: 'bolig-interioer',
    name: 'Bolig & interiør',
    description: 'Vaser, potter og små objekter til hjemmet.',
  },
  {
    id: 'kontor',
    slug: 'kontor-organisering',
    name: 'Kontor & organisering',
    description: 'Holdere og bokse til skrivebordet.',
  },
  {
    id: 'noegleringe',
    slug: 'noegleringe',
    name: 'Nøgleringe',
    description: 'Små, personlige nøgleringe.',
  },
  {
    id: 'gaver',
    slug: 'personlige-gaver',
    name: 'Personlige gaver',
    description: 'Designs der kan gøres personlige.',
  },
  {
    id: 'sokker',
    slug: 'sokker',
    name: 'Sokker',
    description: 'Farverige sokker med mønster og personlighed.',
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
