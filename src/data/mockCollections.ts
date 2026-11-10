import type { Collection } from '../types/product.ts';
import {
  collectionPresentation,
  presentedShopRoutes,
} from './collectionPresentation.ts';
import { allProducts } from './mockProducts.ts';

export { collectionPresentation, presentedShopRoutes };
export type { CollectionPresentation } from './collectionPresentation.ts';

function idsByCollection(collectionId: string): string[] {
  return allProducts
    .filter((product) => product.collectionIds.includes(collectionId))
    .map((product) => product.id);
}

function presented(slug: string, productIds: string[]): Collection {
  const presentation = collectionPresentation[slug];
  if (!presentation) {
    throw new Error(`Mangler præsentation for testdatasættet ${slug}.`);
  }
  return {
    id: slug,
    slug,
    name: presentation.name,
    description: presentation.description,
    productIds,
    heroImageId: presentation.heroImageId,
  };
}

export const collections: Collection[] = [
  presented('3d-produkter', idsByCollection('3d-produkter')),
  presented('sokker', idsByCollection('sokker')),
  presented('popular-3d', [
    'bil-klassisk',
    'bus-klassisk',
    'vase-twist',
    'pen-holder',
  ]),
  presented('new-arrivals', [
    'sokker-citrus',
    'sokker-bølge',
    'sokker-have',
    'sokker-koral',
  ]),
  presented('featured', ['bil-klassisk']),
  presented('gaver', idsByCollection('gaver')),
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

export function getCollectionById(id: string): Collection | undefined {
  return collections.find((collection) => collection.id === id);
}
