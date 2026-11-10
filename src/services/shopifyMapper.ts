import {
  CurrencyCode,
  MediaType,
  ProductStatus,
  ProductType,
  UNMAPPED_CATEGORY_ID,
  type Collection,
  type Inventory,
  type Product,
  type ProductImage,
  type ProductVariant,
} from '../types/product.ts';
import { collectionPresentation } from '../data/collectionPresentation.ts';
import { oreFromKroner } from '../utils/currency.ts';
import type { CatalogMappingIssue } from './catalogStore.ts';
import type {
  ShopifyCollectionRecord,
  ShopifyMoney,
  ShopifyProduct,
  ShopifyProductImage,
  ShopifyProductVariant,
} from './shopifyStorefront.ts';

const SIZE_OPTION_NAMES = new Set(['size', 'størrelse', 'storrelse', 'denominations']);
const COLOR_OPTION_NAMES = new Set(['color', 'colour', 'farve', 'colorway']);
const DEFAULT_VARIANT_TITLES = new Set(['default title', 'defaulttitle']);

const COLOR_PHRASES: Array<{ pattern: RegExp; id: string; hex: string }> = [
  { pattern: /\bsky blue\b|\blight blue\b|\bblå\b|\bblue\b/i, id: 'blue', hex: '#3D6FA8' },
  { pattern: /\blight pink\b|\blyserød\b|\bpink\b/i, id: 'pink', hex: '#E8A0B0' },
  { pattern: /\bbeige\b/i, id: 'beige', hex: '#E6D3B8' },
  { pattern: /\bgrøn\b|\bgreen\b/i, id: 'green', hex: '#2D5A43' },
  { pattern: /\byellow\b|\bgul\b/i, id: 'yellow', hex: '#E3B341' },
  { pattern: /\bbrown\b|\bbrun\b/i, id: 'brown', hex: '#A56A43' },
  { pattern: /\bwhite\b|\bhvid\b/i, id: 'white', hex: '#F4F1EA' },
  { pattern: /\bblack\b|\bsort\b/i, id: 'black', hex: '#1F1C1A' },
];

/**
 * Maps Shopify collection handles onto existing Lulu3D UI collection slugs.
 * Exact handle matches are always kept. This does not invent product membership.
 */
export const COLLECTION_HANDLE_ALIASES: Record<string, readonly string[]> = {
  'new-in': ['new-arrivals'],
  'most-popular': ['popular-3d'],
  socks: ['sokker'],
  sokker: ['sokker'],
  '3d-products': ['3d-produkter'],
  '3d-produkter': ['3d-produkter'],
  gifts: ['gaver'],
  gaver: ['gaver'],
  featured: ['featured'],
};

export type MappedCatalog = {
  products: Product[];
  collections: Collection[];
  mappingIssues: CatalogMappingIssue[];
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('da-DK');
}

function optionNameKey(name: string): string {
  return normalize(name).replaceAll('ø', 'o');
}

export function collectionKeysForHandle(handle: string): string[] {
  const normalized = normalize(handle);
  const aliases = COLLECTION_HANDLE_ALIASES[normalized] ?? [];
  return [normalized, ...aliases].filter(
    (value, index, all) => all.indexOf(value) === index,
  );
}

export function moneyToMinorUnits(money: ShopifyMoney | null | undefined): number | undefined {
  if (!money?.amount) {
    return undefined;
  }
  const amount = Number.parseFloat(money.amount);
  if (!Number.isFinite(amount)) {
    return undefined;
  }
  return oreFromKroner(amount);
}

export function toCurrencyCode(code: string | undefined): CurrencyCode {
  if (code === CurrencyCode.Dkk) {
    return CurrencyCode.Dkk;
  }
  if (code === CurrencyCode.Eur) {
    return CurrencyCode.Eur;
  }
  if (!code) {
    return CurrencyCode.Dkk;
  }
  throw new Error(`Shopify-produktet bruger en valuta, der ikke understøttes: ${code}.`);
}

function haystackOf(
  product: ShopifyProduct,
  extra: string[] = [],
): string {
  return [product.productType, ...product.tags, ...extra]
    .join(' ')
    .toLocaleLowerCase('da-DK');
}

export function mapProductType(input: {
  productType: string;
  tags: string[];
  collectionKeys: string[];
}): ProductType {
  const typeHaystack = [input.productType, ...input.tags].join(' ').toLocaleLowerCase('da-DK');
  if (/\bsokker\b|\bsocks\b|\bsock\b/.test(typeHaystack)) {
    return ProductType.Socks;
  }
  if (/\bprinted-3d\b|\b3d-print|\b3d produkter\b|\b3d-produkter\b/.test(typeHaystack)) {
    return ProductType.Printed3d;
  }

  if (input.collectionKeys.includes('sokker')) {
    return ProductType.Socks;
  }
  if (input.collectionKeys.includes('3d-produkter')) {
    return ProductType.Printed3d;
  }

  return ProductType.Unmapped;
}

export function mapCategoryId(input: {
  productType: ProductType;
  tags: string[];
  shopifyProductType: string;
  collectionKeys: string[];
}): string {
  if (input.collectionKeys.includes('sokker') || input.productType === ProductType.Socks) {
    return 'sokker';
  }
  if (input.collectionKeys.includes('gaver')) {
    return 'gaver';
  }

  const haystack = [input.shopifyProductType, ...input.tags].join(' ').toLocaleLowerCase('da-DK');
  if (/nøgle|keychain|nøglering/.test(haystack)) {
    return 'noegleringe';
  }
  if (/kontor|penholder|organisering/.test(haystack)) {
    return 'kontor';
  }
  if (/vase|potte|bolig|interior|interiør/.test(haystack)) {
    return 'bolig';
  }
  if (/legetøj|legetoj|toy/.test(haystack)) {
    return 'legetoj';
  }
  if (input.productType === ProductType.Printed3d) {
    return 'bolig';
  }

  return UNMAPPED_CATEGORY_ID;
}

function inferColors(product: ShopifyProduct): Array<{ id: string; hex: string; label: string }> {
  const fromOptions = product.options
    .filter((option) => COLOR_OPTION_NAMES.has(optionNameKey(option.name)))
    .flatMap((option) => option.values);

  const sources = [
    ...fromOptions,
    product.title,
    product.handle.replaceAll('-', ' '),
    ...product.tags,
  ];

  const found = new Map<string, { id: string; hex: string; label: string }>();
  for (const source of sources) {
    for (const phrase of COLOR_PHRASES) {
      if (phrase.pattern.test(source) && !found.has(phrase.id)) {
        found.set(phrase.id, {
          id: phrase.id,
          hex: phrase.hex,
          label: source,
        });
      }
    }
  }
  return [...found.values()];
}

function inferMaterials(
  product: ShopifyProduct,
  productType: ProductType,
): string[] {
  const haystack = haystackOf(product, [product.description]);
  const materials = new Set<string>();
  if (/\bpla\b/.test(haystack)) {
    materials.add('PLA');
  }
  if (/bomuld|cotton|bomuldsmix/.test(haystack) || productType === ProductType.Socks) {
    materials.add('bomuldsmix');
  }
  return [...materials];
}

function selectedOption(
  variant: ShopifyProductVariant,
  names: Set<string>,
): string | undefined {
  const match = variant.selectedOptions.find((option) =>
    names.has(optionNameKey(option.name)),
  );
  return match?.value;
}

function variantInventory(variant: ShopifyProductVariant): Inventory {
  if (!variant.availableForSale) {
    return {
      trackQuantity: true,
      availableQuantity: 0,
      allowBackorder: false,
    };
  }

  if (variant.quantityAvailable == null || variant.quantityAvailable <= 0) {
    return {
      trackQuantity: false,
      availableQuantity: 0,
      allowBackorder: false,
    };
  }

  return {
    trackQuantity: true,
    availableQuantity: variant.quantityAvailable,
    allowBackorder: false,
  };
}

function mapImage(
  image: ShopifyProductImage,
  fallbackAlt: string,
): ProductImage {
  return {
    id: image.id,
    src: image.url,
    alt: image.altText?.trim() || fallbackAlt,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
    mediaType: MediaType.Image,
    assetStatus: 'supplied',
  };
}

function shortDescriptionFrom(description: string, title: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    return title;
  }
  const sentence = trimmed.split(/(?<=[.!?])\s+/)[0];
  return (sentence ?? trimmed).slice(0, 220);
}

function detailsFromDescription(description: string): string[] {
  return description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function presentationForKeys(keys: string[]): (typeof collectionPresentation)[string] | undefined {
  for (const key of keys) {
    const presentation = collectionPresentation[key];
    if (presentation) {
      return presentation;
    }
  }
  return undefined;
}

export function mapShopifyCollection(
  collection: ShopifyCollectionRecord,
): Collection {
  const keys = collectionKeysForHandle(collection.handle);
  const presentation = presentationForKeys(keys);
  return {
    id: collection.id,
    slug: collection.handle,
    name: presentation?.name ?? collection.title,
    description: presentation?.description || collection.description,
    productIds: [...collection.productIds],
    heroImageId: presentation?.heroImageId,
  };
}

export function mapShopifyProduct(
  product: ShopifyProduct,
  collectionHandles: string[] = [],
): Product {
  const tags = product.tags.map((tag) => tag.trim()).filter(Boolean);
  const collectionIds = collectionHandles.flatMap(collectionKeysForHandle);
  const uniqueCollectionIds = [...new Set(collectionIds)];
  const productType = mapProductType({
    productType: product.productType,
    tags,
    collectionKeys: uniqueCollectionIds,
  });
  const inferredColors = inferColors(product);
  const images = product.images.nodes.map((image) => mapImage(image, product.title));
  const firstVariant = product.variants.nodes[0];
  const priceAmount = moneyToMinorUnits(firstVariant?.price) ?? 0;
  const compareAtPriceAmount = moneyToMinorUnits(firstVariant?.compareAtPrice);
  const currency = toCurrencyCode(firstVariant?.price.currencyCode);
  const normalizedTags = tags.map(normalize);

  const variants: ProductVariant[] = product.variants.nodes.map((variant) => {
    const colorValue = selectedOption(variant, COLOR_OPTION_NAMES);
    const sizeValue = selectedOption(variant, SIZE_OPTION_NAMES);
    const inferredColor =
      inferredColors.find((color) =>
        colorValue ? normalize(colorValue).includes(color.id) : true,
      ) ?? inferredColors[0];
    const imageIds = variant.image
      ? images.some((image) => image.id === variant.image?.id)
        ? [variant.image.id]
        : (() => {
            images.push(mapImage(variant.image, product.title));
            return [variant.image.id];
          })()
      : images.map((image) => image.id);
    const isDefaultTitle = DEFAULT_VARIANT_TITLES.has(normalize(variant.title));

    return {
      id: variant.id,
      sku: variant.sku?.trim() ?? '',
      label: isDefaultTitle ? product.title : variant.title,
      colorName: colorValue ?? (sizeValue ? undefined : inferredColor?.id),
      colorHex: colorValue || !sizeValue ? inferredColor?.hex : undefined,
      size: sizeValue,
      priceOverride: moneyToMinorUnits(variant.price),
      compareAtPriceOverride: moneyToMinorUnits(variant.compareAtPrice),
      imageIds,
      inventory: variantInventory(variant),
      isAvailable: variant.availableForSale,
    };
  });

  const productInventory: Inventory = variants.some((variant) => variant.inventory.trackQuantity)
    ? {
        trackQuantity: true,
        availableQuantity: variants.reduce(
          (total, variant) =>
            total +
            (variant.inventory.trackQuantity ? variant.inventory.availableQuantity : 0),
          0,
        ),
        allowBackorder: false,
      }
    : {
        trackQuantity: false,
        availableQuantity: 0,
        allowBackorder: false,
      };

  const specifications = [
    ...(product.vendor ? [{ label: 'Producent', value: product.vendor }] : []),
    ...(product.productType ? [{ label: 'Type', value: product.productType }] : []),
  ];

  return {
    id: product.id,
    slug: product.handle,
    name: product.title,
    shortDescription: shortDescriptionFrom(product.description, product.title),
    description: product.description.trim() || product.title,
    categoryId: mapCategoryId({
      productType,
      tags,
      shopifyProductType: product.productType,
      collectionKeys: uniqueCollectionIds,
    }),
    collectionIds: uniqueCollectionIds,
    productType,
    status: ProductStatus.Active,
    priceAmount,
    compareAtPriceAmount:
      compareAtPriceAmount && compareAtPriceAmount > priceAmount
        ? compareAtPriceAmount
        : undefined,
    currency,
    images,
    variants,
    materials: inferMaterials(product, productType),
    colors: inferredColors.map((color) => color.id),
    tags,
    isNew:
      normalizedTags.some((tag) => ['nyhed', 'nyheder', 'new'].includes(tag)) ||
      uniqueCollectionIds.includes('new-arrivals'),
    isFeatured:
      normalizedTags.some((tag) =>
        ['udvalgt', 'featured', 'popular', 'populær'].includes(tag),
      ) || uniqueCollectionIds.includes('popular-3d') ||
      uniqueCollectionIds.includes('featured'),
    isBestSeller: normalizedTags.some((tag) =>
      ['bestseller', 'best-seller', 'mest solgte'].includes(tag),
    ),
    inventory: productInventory,
    specifications,
    details: detailsFromDescription(product.description),
    materialSafety: [],
    deliveryInformation: [],
    complementaryProductIds: [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function mappingIssueFor(
  product: ShopifyProduct,
  mapped: Product,
): CatalogMappingIssue {
  return {
    productId: mapped.id,
    handle: mapped.slug,
    title: mapped.name,
    missingProductType: !product.productType.trim(),
    missingTags: product.tags.length === 0,
    unmappedCategory: mapped.categoryId === UNMAPPED_CATEGORY_ID,
    unmappedProductType: mapped.productType === ProductType.Unmapped,
    withoutCollections: mapped.collectionIds.length === 0,
  };
}

export function mapShopifyCatalog(
  shopifyProducts: ShopifyProduct[],
  shopifyCollections: ShopifyCollectionRecord[] = [],
): MappedCatalog {
  const membership = new Map<string, string[]>();
  for (const collection of shopifyCollections) {
    for (const productId of collection.productIds) {
      const handles = membership.get(productId) ?? [];
      handles.push(collection.handle);
      membership.set(productId, handles);
    }
  }

  const products = shopifyProducts.map((product) =>
    mapShopifyProduct(product, membership.get(product.id) ?? []),
  );

  return {
    products,
    collections: shopifyCollections.map(mapShopifyCollection),
    mappingIssues: shopifyProducts.map((product, index) =>
      mappingIssueFor(product, products[index]!),
    ),
  };
}
