export const ProductType = {
  Printed3d: 'printed-3d',
  Socks: 'socks',
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const ProductStatus = {
  Active: 'active',
  Draft: 'draft',
  Archived: 'archived',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const MediaType = {
  Image: 'image',
  Video: 'video',
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const CurrencyCode = {
  Dkk: 'DKK',
} as const;

export type CurrencyCode = (typeof CurrencyCode)[keyof typeof CurrencyCode];

export const RatingSource = {
  DevelopmentFixture: 'development-fixture',
  Live: 'live',
} as const;

export type RatingSource = (typeof RatingSource)[keyof typeof RatingSource];

export type Inventory = {
  trackQuantity: boolean;
  availableQuantity: number;
  allowBackorder: boolean;
};

export type ProductImage = {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  mediaType: MediaType;
  assetStatus: 'supplied' | 'placeholder';
};

export type ProductVariant = {
  id: string;
  sku: string;
  label: string;
  colorName?: string;
  colorHex?: string;
  size?: string;
  priceOverride?: number;
  compareAtPriceOverride?: number;
  imageIds: string[];
  inventory: Inventory;
  isAvailable: boolean;
};

export type RatingSummary = {
  average: number;
  count: number;
  source: RatingSource;
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  collectionIds: string[];
  productType: ProductType;
  status: ProductStatus;
  /** Price in øre (1 kr. = 100). */
  priceAmount: number;
  compareAtPriceAmount?: number;
  currency: CurrencyCode;
  images: ProductImage[];
  variants: ProductVariant[];
  materials: string[];
  colors: string[];
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  ratingSummary?: RatingSummary;
  inventory: Inventory;
  specifications: ProductSpecification[];
  details: string[];
  materialSafety: string[];
  deliveryInformation: string[];
  complementaryProductIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  productIds: string[];
  heroImageId?: string;
};

export const SortKey = {
  Popular: 'popular',
  PriceAsc: 'price-asc',
  PriceDesc: 'price-desc',
  Newest: 'newest',
  NameAsc: 'name-asc',
} as const;

export type SortKey = (typeof SortKey)[keyof typeof SortKey];

export type CatalogFilters = {
  collectionId?: string;
  categoryId?: string;
  minPriceOre?: number;
  maxPriceOre?: number;
  colors: string[];
  materials: string[];
  isNew?: boolean;
  inStock?: boolean;
  productType?: ProductType;
  query?: string;
};

export type CatalogQuery = CatalogFilters & {
  sort: SortKey;
  page: number;
  pageSize: number;
};

export type CatalogResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
