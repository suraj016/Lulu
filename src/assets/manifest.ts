import shopBottomBanner from './Shop/BottomBanner.png';
import shopTopBanner from './Shop/TopBanner.png';
import aboutSecondBanner from './About/SecondBanner.png';
import aboutThirdBanner from './About/ThirdBanner.png';
import aboutProcess11 from './About/11.jpeg';
import aboutProcess12 from './About/12.jpeg';
import aboutProcess13 from './About/13.jpeg';
import aboutProcess14 from './About/14.jpeg';
import frontBenefitsBanner from './Front/2Banner.png';
import contactKonkat from './Konkat/Konakat.png';
import frontSocksBanner from './Front/1Banner.png';
import heroHomePhoto from './Forside/image00001.webp';
import luluLogo from './luluLogo.jpeg';

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
    src: luluLogo,
    alt: 'Lulu3D — Vi gør idéer fysiske',
    status: AssetStatus.Supplied,
    notes: 'Official brand logo from src/assets/luluLogo.jpeg.',
    width: 640,
    height: 640,
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
    notes: 'Homepage hero photograph from src/assets/Forside/image00001.webp.',
    width: 1920,
    height: 720,
  },
  socksCampaign: {
    id: 'socks-campaign',
    src: frontSocksBanner,
    alt: 'Person med farverige ankelsokker i dagslys',
    status: AssetStatus.Supplied,
    notes: 'Homepage socks banner — src/assets/Front/1Banner.png.',
    width: 1920,
    height: 720,
  },
  brandBenefits: {
    id: 'brand-benefits',
    src: frontBenefitsBanner,
    alt: 'Farverige sokker med broderede motiver på et træbord',
    status: AssetStatus.Supplied,
    notes: 'Homepage benefits banner — src/assets/Front/2Banner.png.',
    width: 1920,
    height: 720,
  },
  catalogBanner: {
    id: 'catalog-banner',
    src: shopTopBanner,
    alt: '3D-printede legetøjsbiler og planter i naturligt lys',
    status: AssetStatus.Supplied,
    notes: 'Shop catalog hero — src/assets/Shop/TopBanner.png.',
    width: 1920,
    height: 640,
  },
  sustainabilityBanner: {
    id: 'sustainability-banner',
    src: shopBottomBanner,
    alt: 'Monstera-plante i hvid vase i dagslys',
    status: AssetStatus.Supplied,
    notes: 'Shop lower PLA banner — src/assets/Shop/BottomBanner.png.',
    width: 1920,
    height: 640,
  },
  aboutHero: {
    id: 'about-hero',
    src: shopTopBanner,
    alt: '3D-printede legetøjsbiler og planter i naturligt lys',
    status: AssetStatus.Supplied,
    notes: 'About hero — src/assets/Shop/TopBanner.png.',
    width: 1920,
    height: 640,
  },
  aboutUniqueness: {
    id: 'about-uniqueness',
    src: aboutThirdBanner,
    alt: '3D-printet vase i sagegrøn på et træbord',
    status: AssetStatus.Supplied,
    notes: 'About uniqueness banner — src/assets/About/ThirdBanner.png.',
    width: 1920,
    height: 720,
  },
  aboutBanner: {
    id: 'about-banner',
    src: aboutSecondBanner,
    alt: 'Legetøj og figurer på et træbord i dagslys',
    status: AssetStatus.Supplied,
    notes: 'About shop CTA banner — src/assets/About/SecondBanner.png.',
    width: 1920,
    height: 720,
  },
  contactHero: {
    id: 'contact-hero',
    src: contactKonkat,
    alt: 'Vase, planter og figurer på et træbord i dagslys',
    status: AssetStatus.Supplied,
    notes: 'Contact page hero — src/assets/Konkat/Konakat.png.',
    width: 1200,
    height: 1200,
  },
  processDesign: {
    id: 'process-design',
    src: aboutProcess11,
    alt: '3D-design af et figurdyr på en bærbar computer',
    status: AssetStatus.Supplied,
    notes: 'About process step 1 — src/assets/About/11.jpeg.',
    width: 1200,
    height: 900,
  },
  processPrint: {
    id: 'process-print',
    src: aboutProcess12,
    alt: '3D-printer der færdiggør et grønt figurdyr',
    status: AssetStatus.Supplied,
    notes: 'About process step 2 — src/assets/About/12.jpeg.',
    width: 1200,
    height: 900,
  },
  processPack: {
    id: 'process-pack',
    src: aboutProcess13,
    alt: 'Et 3D-printet figurdyr pakkes i papirfyld i en kasse',
    status: AssetStatus.Supplied,
    notes: 'About process step 3 — src/assets/About/13.jpeg.',
    width: 1200,
    height: 900,
  },
  processShip: {
    id: 'process-ship',
    src: aboutProcess14,
    alt: 'Lulu3D-forsendelseskasse klar på et bord',
    status: AssetStatus.Supplied,
    notes: 'About process step 4 — src/assets/About/14.jpeg.',
    width: 1200,
    height: 900,
  },
} as const satisfies Record<string, AssetEntry>;

export const missingSuppliedAssets: AssetEntry[] = [
  ...Object.values(brandAssets),
  ...Object.values(editorialAssets),
].filter((asset) => asset.status === AssetStatus.Placeholder);

export function productImagePath(fileName: string): string {
  return `/placeholders/products/${fileName}`;
}
