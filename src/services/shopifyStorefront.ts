import type { MappedCatalog } from './shopifyMapper.ts';
import { mapShopifyCatalog } from './shopifyMapper.ts';
import type { Product } from '../types/product.ts';
import type { CatalogMappingIssue } from './catalogStore.ts';

export class ShopifyStorefrontError extends Error {
  readonly status?: number;
  readonly graphqlErrors?: readonly string[];

  constructor(
    message: string,
    options?: { status?: number; graphqlErrors?: readonly string[] },
  ) {
    super(message);
    this.name = 'ShopifyStorefrontError';
    this.status = options?.status;
    this.graphqlErrors = options?.graphqlErrors;
  }
}

export type StorefrontConfig = {
  domain: string;
  apiVersion: string;
  publicToken: string;
};

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyProductImage = {
  id: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type ShopifySelectedOption = {
  name: string;
  value: string;
};

export type ShopifyProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: ShopifySelectedOption[];
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  image?: ShopifyProductImage | null;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  availableForSale: boolean;
  options: ShopifyProductOption[];
  images: { nodes: ShopifyProductImage[] };
  variants: { nodes: ShopifyProductVariant[] };
};

type GraphQLError = {
  message?: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export type ShopifyCollectionRecord = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ShopifyProductImage | null;
  productIds: string[];
};

type ConnectionPageInfo = {
  hasNextPage: boolean;
  endCursor?: string | null;
};

type ProductsQueryData = {
  products: {
    pageInfo: ConnectionPageInfo;
    nodes: ShopifyProduct[];
  };
};

type CollectionsQueryData = {
  collections: {
    pageInfo: ConnectionPageInfo;
    nodes: Array<{
      id: string;
      handle: string;
      title: string;
      description: string;
      image?: ShopifyProductImage | null;
      products: {
        pageInfo: ConnectionPageInfo;
        nodes: Array<{ id: string }>;
      };
    }>;
  };
};

type CollectionProductsQueryData = {
  collection?: {
    products: {
      pageInfo: ConnectionPageInfo;
      nodes: Array<{ id: string }>;
    };
  } | null;
};

const PRODUCTS_PAGE_SIZE = 50;
const PRODUCTS_MAX = 500;
const COLLECTIONS_PAGE_SIZE = 50;
const COLLECTIONS_MAX = 100;

export const STOREFRONT_PRODUCTS_QUERY = `
  query StorefrontProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        description
        productType
        vendor
        tags
        createdAt
        updatedAt
        availableForSale
        options {
          id
          name
          values
        }
        images(first: 20) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        variants(first: 100) {
          nodes {
            id
            title
            sku
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

export const STOREFRONT_COLLECTIONS_QUERY = `
  query StorefrontCollections($first: Int!, $after: String, $productsFirst: Int!) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        description
        image {
          id
          url
          altText
          width
          height
        }
        products(first: $productsFirst) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
          }
        }
      }
    }
  }
`;

export const STOREFRONT_COLLECTION_PRODUCTS_QUERY = `
  query StorefrontCollectionProducts($id: ID!, $first: Int!, $after: String) {
    collection(id: $id) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
        }
      }
    }
  }
`;

function requiredEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]?.trim();
  if (!value) {
    throw new ShopifyStorefrontError(
      `Mangler ${name} i miljøvariablerne. Tilføj den i .env, og genstart udviklingsserveren.`,
    );
  }
  return value;
}

export function readStorefrontConfig(): StorefrontConfig {
  const domain = requiredEnv('VITE_SHOPIFY_STORE_DOMAIN')
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  const apiVersion = requiredEnv('VITE_SHOPIFY_STOREFRONT_API_VERSION');
  const publicToken = requiredEnv('VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN');

  if (domain.includes('/')) {
    throw new ShopifyStorefrontError(
      'VITE_SHOPIFY_STORE_DOMAIN skal være et butiksdomæne uden sti, f.eks. butik.myshopify.com.',
    );
  }

  return { domain, apiVersion, publicToken };
}

export function storefrontEndpoint(config: StorefrontConfig): string {
  return `https://${config.domain}/api/${config.apiVersion}/graphql.json`;
}

export async function storefrontRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  config: StorefrontConfig = readStorefrontConfig(),
): Promise<T> {
  const endpoint = storefrontEndpoint(config);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.publicToken,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ShopifyStorefrontError(
      'Kunne ikke forbinde til Shopify Storefront API. Tjek netværket og butiksdomænet.',
    );
  }

  let payload: GraphQLResponse<T>;
  try {
    payload = (await response.json()) as GraphQLResponse<T>;
  } catch {
    throw new ShopifyStorefrontError(
      `Shopify Storefront API svarede med ugyldig JSON (HTTP ${response.status}).`,
      { status: response.status },
    );
  }

  const graphqlMessages = (payload.errors ?? [])
    .map((error) => error.message?.trim())
    .filter((message): message is string => Boolean(message));

  if (!response.ok) {
    throw new ShopifyStorefrontError(
      `Shopify Storefront API svarede med HTTP ${response.status}.`,
      { status: response.status, graphqlErrors: graphqlMessages },
    );
  }

  if (graphqlMessages.length > 0) {
    throw new ShopifyStorefrontError(
      `Shopify Storefront GraphQL-fejl: ${graphqlMessages.join(' ')}`,
      { status: response.status, graphqlErrors: graphqlMessages },
    );
  }

  if (!payload.data) {
    throw new ShopifyStorefrontError(
      'Shopify Storefront API returnerede intet datafelt.',
      { status: response.status },
    );
  }

  return payload.data;
}

async function fetchAllShopifyProducts(
  config: StorefrontConfig,
): Promise<ShopifyProduct[]> {
  const nodes: ShopifyProduct[] = [];
  let after: string | undefined;

  while (nodes.length < PRODUCTS_MAX) {
    const page: ProductsQueryData = await storefrontRequest<ProductsQueryData>(
      STOREFRONT_PRODUCTS_QUERY,
      { first: PRODUCTS_PAGE_SIZE, after: after ?? null },
      config,
    );
    nodes.push(...page.products.nodes);

    if (!page.products.pageInfo.hasNextPage || !page.products.pageInfo.endCursor) {
      break;
    }
    after = page.products.pageInfo.endCursor;
  }

  return nodes;
}

async function fetchCollectionProductIds(
  collectionId: string,
  initial: { pageInfo: ConnectionPageInfo; nodes: Array<{ id: string }> },
  config: StorefrontConfig,
): Promise<string[]> {
  const productIds = initial.nodes.map((node) => node.id);
  let after =
    initial.pageInfo.hasNextPage && initial.pageInfo.endCursor
      ? initial.pageInfo.endCursor
      : undefined;

  while (after && productIds.length < PRODUCTS_MAX) {
    const page = await storefrontRequest<CollectionProductsQueryData>(
      STOREFRONT_COLLECTION_PRODUCTS_QUERY,
      { id: collectionId, first: PRODUCTS_PAGE_SIZE, after },
      config,
    );
    const connection = page.collection?.products;
    if (!connection) {
      break;
    }
    productIds.push(...connection.nodes.map((node) => node.id));
    after =
      connection.pageInfo.hasNextPage && connection.pageInfo.endCursor
        ? connection.pageInfo.endCursor
        : undefined;
  }

  return productIds;
}

async function fetchAllShopifyCollections(
  config: StorefrontConfig,
): Promise<ShopifyCollectionRecord[]> {
  const records: ShopifyCollectionRecord[] = [];
  let after: string | undefined;

  while (records.length < COLLECTIONS_MAX) {
    const page = await storefrontRequest<CollectionsQueryData>(
      STOREFRONT_COLLECTIONS_QUERY,
      {
        first: COLLECTIONS_PAGE_SIZE,
        after: after ?? null,
        productsFirst: PRODUCTS_PAGE_SIZE,
      },
      config,
    );

    for (const node of page.collections.nodes) {
      records.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description,
        image: node.image,
        productIds: await fetchCollectionProductIds(node.id, node.products, config),
      });
    }

    if (!page.collections.pageInfo.hasNextPage || !page.collections.pageInfo.endCursor) {
      break;
    }
    after = page.collections.pageInfo.endCursor;
  }

  return records;
}

export async function fetchStorefrontCatalog(
  config: StorefrontConfig = readStorefrontConfig(),
): Promise<MappedCatalog> {
  const [products, collections] = await Promise.all([
    fetchAllShopifyProducts(config),
    fetchAllShopifyCollections(config),
  ]);
  return mapShopifyCatalog(products, collections);
}

export async function fetchStorefrontProducts(
  config: StorefrontConfig = readStorefrontConfig(),
): Promise<Product[]> {
  const catalog = await fetchStorefrontCatalog(config);
  return catalog.products;
}

export type StorefrontDiagnosis = {
  ok: true;
  productCount: number;
  collectionCount: number;
  handles: string[];
  collectionHandles: string[];
  mappingIssues: CatalogMappingIssue[];
};

export async function diagnoseStorefrontConnection(
  config: StorefrontConfig = readStorefrontConfig(),
): Promise<StorefrontDiagnosis> {
  const catalog = await fetchStorefrontCatalog(config);
  return {
    ok: true,
    productCount: catalog.products.length,
    collectionCount: catalog.collections.length,
    handles: catalog.products.map((product) => product.slug),
    collectionHandles: catalog.collections.map((collection) => collection.slug),
    mappingIssues: catalog.mappingIssues,
  };
}
