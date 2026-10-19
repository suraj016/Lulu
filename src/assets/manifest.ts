import heroHomePhoto from './Forside/image00001.png';

/**
 * Central mapping between UI slots and image files.
 * Replace `placeholder` entries with supplied brand assets when they arrive.
 * Do not invent paths for files that are not in the repository.
 */
export const AssetStatus = {
  Supplied: 'supplied',
  Placeholder: 'placeholder',
  Missing: 'missing',
} as const;

export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];

export type AssetEntry = {
  id: string;
  src: string;
  alt: string;
  status: AssetStatus;
  notes: string;
  width?: number;
  height?: number;
};

export const brandAssets = {
  logo: {
    id: 'logo',
    src: '/placeholders/brand/logo.svg',
    alt: 'Lulu3D',
    status: AssetStatus.Placeholder,
    notes: 'Awaiting official brand logo. Temporary wordmark is used.',
    width: 220,
    height: 56,
  },
  favicon: {
    id: 'favicon',
    src: '/placeholders/brand/mark.svg',
    alt: 'Lulu3D',
    status: AssetStatus.Placeholder,
    notes: 'Awaiting official favicon.',
    width: 64,
    height: 64,
  },
} as const satisfies Record<string, AssetEntry>;

export const editorialAssets = {
  heroHome: {
    id: 'hero-home',
    src: heroHomePhoto,
    alt: 'Tre 3D-printede legetøjsbiler på et træbord',
    status: AssetStatus.Supplied,
    notes: 'Homepage hero photograph from src/assets/Forside/image00001.png.',
    width: 2048,
    height: 768,
  },
  socksCampaign: {
    id: 'socks-campaign',
    src: '/placeholders/editorial/socks-campaign.svg',
    alt: 'Farverige sokker i bløde folder',
    status: AssetStatus.Placeholder,
    notes: 'Homepage socks feature. Replace with campaign photograph.',
    width: 1200,
    height: 1200,
  },
  brandBenefits: {
    id: 'brand-benefits',
    src: '/placeholders/editorial/brand-benefits.svg',
    alt: 'Nærbillede af mønstrede sokker',
    status: AssetStatus.Placeholder,
    notes: 'Homepage brand-benefits split. Awaiting supplied lifestyle image.',
    width: 1200,
    height: 1400,
  },
  catalogBanner: {
    id: 'catalog-banner',
    src: '/placeholders/editorial/catalog-banner.svg',
    alt: 'Udvalg af 3D-printede produkter',
    status: AssetStatus.Placeholder,
    notes: 'Catalog promotional banner. Awaiting supplied image.',
    width: 1600,
    height: 640,
  },
  sustainabilityBanner: {
    id: 'sustainability-banner',
    src: '/placeholders/editorial/sustainability-banner.svg',
    alt: 'Materialer og print i et roligt værkstedslys',
    status: AssetStatus.Placeholder,
    notes: 'Lower catalog banner. Awaiting supplied image.',
    width: 1600,
    height: 560,
  },
  aboutHero: {
    id: 'about-hero',
    src: '/placeholders/editorial/about-hero.svg',
    alt: 'Lulu3D produkter på et varmt underlag',
    status: AssetStatus.Placeholder,
    notes: 'About page hero photograph. Awaiting supplied image.',
    width: 1200,
    height: 1400,
  },
  aboutUniqueness: {
    id: 'about-uniqueness',
    src: '/placeholders/editorial/about-uniqueness.svg',
    alt: 'Nærbillede af en 3D-printet overflade',
    status: AssetStatus.Placeholder,
    notes: 'About uniqueness section. Awaiting supplied product photograph.',
    width: 1200,
    height: 1200,
  },
  aboutBanner: {
    id: 'about-banner',
    src: '/placeholders/editorial/about-banner.svg',
    alt: 'Farverige Lulu3D produkter',
    status: AssetStatus.Placeholder,
    notes: 'About promotional banner. Awaiting supplied assets.',
    width: 1600,
    height: 560,
  },
  contactHero: {
    id: 'contact-hero',
    src: '/placeholders/editorial/contact-hero.svg',
    alt: 'Rolig livsstilsopsætning med Lulu3D produkter',
    status: AssetStatus.Placeholder,
    notes: 'Contact page lifestyle image. Awaiting supplied photograph.',
    width: 1200,
    height: 1400,
  },
  processDesign: {
    id: 'process-design',
    src: '/placeholders/editorial/process-design.svg',
    alt: 'Skitser og formstudier på et skrivebord',
    status: AssetStatus.Placeholder,
    notes: 'About process step 1. Awaiting supplied image.',
    width: 800,
    height: 800,
  },
  processPrint: {
    id: 'process-print',
    src: '/placeholders/editorial/process-print.svg',
    alt: '3D-printer i arbejde',
    status: AssetStatus.Placeholder,
    notes: 'About process step 2. Awaiting supplied image.',
    width: 800,
    height: 800,
  },
  processPack: {
    id: 'process-pack',
    src: '/placeholders/editorial/process-pack.svg',
    alt: 'Produkter pakkes omhyggeligt',
    status: AssetStatus.Placeholder,
    notes: 'About process step 3. Awaiting supplied image.',
    width: 800,
    height: 800,
  },
  processShip: {
    id: 'process-ship',
    src: '/placeholders/editorial/process-ship.svg',
    alt: 'Pakke klar til afsendelse',
    status: AssetStatus.Placeholder,
    notes: 'About process step 4. Awaiting supplied image.',
    width: 800,
    height: 800,
  },
} as const satisfies Record<string, AssetEntry>;

export const missingSuppliedAssets: AssetEntry[] = [
  ...Object.values(brandAssets),
  ...Object.values(editorialAssets),
].filter((asset) => asset.status === AssetStatus.Placeholder);

export function productImagePath(fileName: string): string {
  return `/placeholders/products/${fileName}`;
}
