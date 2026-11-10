import { editorialAssets } from '../assets/manifest.ts';

export type CollectionPresentation = {
  name: string;
  description: string;
  heroImageId?: string;
};

export const presentedShopRoutes = ['3d-produkter', 'sokker'] as const;

export const collectionPresentation: Record<string, CollectionPresentation> = {
  '3d-produkter': {
    name: '3D-produkter',
    description:
      '3D-printede designs til leg, hjemmet og små gaver. Printet i små serier — hvert stykke kan have sin egen karakter.',
    heroImageId: editorialAssets.catalogBanner.id,
  },
  sokker: {
    name: 'Sokker',
    description:
      'Farverige sokker med mønster og personlighed. Et par til skuffen — eller en gave, der er nem at give.',
    heroImageId: editorialAssets.socksCampaign.id,
  },
  'popular-3d': {
    name: 'Populære 3D-produkter',
    description: 'Et udvalg af de mest viste 3D-produkter.',
  },
  'new-arrivals': {
    name: 'Nyheder',
    description: 'Nyeste produkter i kataloget.',
  },
  featured: {
    name: 'Udvalgt',
    description: 'Produkter vist i hero og kampagner.',
  },
  gaver: {
    name: 'Personlige gaver',
    description: 'Små designs, der egner sig som gave.',
  },
};
