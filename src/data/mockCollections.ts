import { editorialAssets } from '../assets/manifest.ts';
import type { Collection } from '../types/product.ts';
import { allProducts } from './mockProducts.ts';

function idsByCollection(collectionId: string): string[] {
  return allProducts
    .filter((product) => product.collectionIds.includes(collectionId))
    .map((product) => product.id);
}

export const collections: Collection[] = [
  {
    id: '3d-produkter',
    slug: '3d-produkter',
    name: '3D-produkter',
    description:
      '3D-printede designs til leg, hjemmet og små gaver. Printet i små serier — hvert stykke kan have sin egen karakter.',
    productIds: idsByCollection('3d-produkter'),
    heroImageId: editorialAssets.catalogBanner.id,
  },
  {
    id: 'sokker',
    slug: 'sokker',
    name: 'Sokker',
    description:
      'Farverige sokker med mønster og personlighed. Et par til skuffen — eller en gave, der er nem at give.',
    productIds: idsByCollection('sokker'),
    heroImageId: editorialAssets.socksCampaign.id,
  },
  {
    id: 'popular-3d',
    slug: 'popular-3d',
    name: 'Populære 3D-produkter',
    description: 'Et udvalg af de mest viste 3D-produkter i denne prototype.',
    productIds: ['bil-klassisk', 'bus-klassisk', 'vase-twist', 'pen-holder'],
  },
  {
    id: 'new-arrivals',
    slug: 'new-arrivals',
    name: 'Nyheder',
    description: 'Nyeste sokker i kataloget.',
    productIds: [
      'sokker-citrus',
      'sokker-bølge',
      'sokker-have',
      'sokker-koral',
    ],
  },
  {
    id: 'featured',
    slug: 'featured',
    name: 'Udvalgt',
    description: 'Produkter vist i hero og kampagner.',
    productIds: ['bil-klassisk'],
  },
  {
    id: 'gaver',
    slug: 'gaver',
    name: 'Personlige gaver',
    description: 'Små designs, der egner sig som gave.',
    productIds: idsByCollection('gaver'),
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

export function getCollectionById(id: string): Collection | undefined {
  return collections.find((collection) => collection.id === id);
}
