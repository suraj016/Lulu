import { CurrencyCode } from '../types/product.ts';
import { moneyToMinorUnits, toCurrencyCode } from './shopifyMapper.ts';
import {
  ShopifyStorefrontError,
  storefrontRequest,
  type ShopifyMoney,
  type StorefrontConfig,
} from './shopifyStorefront.ts';

export type ShopifyCartMerchandise = {
  id: string;
  title: string;
  availableForSale: boolean;
  product: {
    id: string;
    handle: string;
    title: string;
  };
};

export type ShopifyCartLineNode = {
  id: string;
  quantity: number;
  cost: {
    amountPerQuantity: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  merchandise: ShopifyCartMerchandise | Record<string, never>;
};

export type ShopifyCartPayload = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney | null;
  };
  lines: {
    nodes: ShopifyCartLineNode[];
  };
};

export type MappedCartLine = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
  currency: CurrencyCode;
  merchandiseAvailable: boolean;
};

export type MappedCart = {
  cartId: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotalAmount: number;
  totalAmount: number;
  currency: CurrencyCode;
  lines: MappedCartLine[];
};

type UserError = {
  field?: string[] | null;
  message?: string | null;
};

type CartMutationPayload = {
  cart?: ShopifyCartPayload | null;
  userErrors?: UserError[];
};

type CartQueryData = {
  cart?: ShopifyCartPayload | null;
};

type CartCreateData = {
  cartCreate: CartMutationPayload;
};

type CartLinesAddData = {
  cartLinesAdd: CartMutationPayload;
};

type CartLinesUpdateData = {
  cartLinesUpdate: CartMutationPayload;
};

type CartLinesRemoveData = {
  cartLinesRemove: CartMutationPayload;
};

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
};

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
    totalTaxAmount { amount currencyCode }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost {
        amountPerQuantity { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          product {
            id
            handle
            title
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation ShopifyCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation ShopifyCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation ShopifyCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation ShopifyCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

export const CART_QUERY = `
  query ShopifyCart($id: ID!) {
    cart(id: $id) {
      ${CART_FIELDS}
    }
  }
`;

let inFlightCreate: Promise<MappedCart> | null = null;

export function isShopifyGid(value: string, resource: string): boolean {
  return value.startsWith(`gid://shopify/${resource}/`);
}

export function isLegacyCartLine(line: {
  productId?: string;
  variantId?: string;
}): boolean {
  const productId = line.productId ?? '';
  const variantId = line.variantId ?? '';
  return (
    !isShopifyGid(productId, 'Product') ||
    !isShopifyGid(variantId, 'ProductVariant')
  );
}

export function isStaleCartError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLocaleLowerCase('en-US') : '';
  return (
    message.includes('specified cart does not exist') ||
    message.includes('cart does not exist') ||
    message.includes('cart not found') ||
    message.includes('invalid cart id')
  );
}

export function isSafeCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      Boolean(parsed.hostname) &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
}

export function isProductVariantMerchandise(
  merchandise: ShopifyCartLineNode['merchandise'],
): merchandise is ShopifyCartMerchandise {
  return (
    typeof merchandise === 'object' &&
    merchandise !== null &&
    'id' in merchandise &&
    typeof merchandise.id === 'string' &&
    merchandise.id.startsWith('gid://shopify/ProductVariant/')
  );
}

function userErrorMessages(errors: UserError[] | undefined): string[] {
  return (errors ?? [])
    .map((error) => error.message?.trim())
    .filter((message): message is string => Boolean(message));
}

export function unwrapCartMutation(
  payload: CartMutationPayload,
  fallback: string,
): ShopifyCartPayload {
  const errors = userErrorMessages(payload.userErrors);
  if (errors.length > 0) {
    throw new ShopifyStorefrontError(errors.join(' '), {
      graphqlErrors: errors,
    });
  }
  if (!payload.cart) {
    throw new ShopifyStorefrontError(fallback);
  }
  return payload.cart;
}

export function mapShopifyCart(payload: ShopifyCartPayload): MappedCart {
  const currency = toCurrencyCode(payload.cost.subtotalAmount.currencyCode);
  const lines = payload.lines.nodes.flatMap((node) => {
    if (!isProductVariantMerchandise(node.merchandise)) {
      return [];
    }
    return [
      {
        id: node.id,
        productId: node.merchandise.product.id,
        variantId: node.merchandise.id,
        quantity: node.quantity,
        unitAmount: moneyToMinorUnits(node.cost.amountPerQuantity) ?? 0,
        lineAmount: moneyToMinorUnits(node.cost.totalAmount) ?? 0,
        currency: toCurrencyCode(node.cost.totalAmount.currencyCode),
        merchandiseAvailable: node.merchandise.availableForSale,
      } satisfies MappedCartLine,
    ];
  });

  return {
    cartId: payload.id,
    checkoutUrl: payload.checkoutUrl,
    totalQuantity: payload.totalQuantity,
    subtotalAmount: moneyToMinorUnits(payload.cost.subtotalAmount) ?? 0,
    totalAmount: moneyToMinorUnits(payload.cost.totalAmount) ?? 0,
    currency,
    lines,
  };
}

export async function fetchShopifyCart(
  cartId: string,
  config?: StorefrontConfig,
): Promise<MappedCart | null> {
  if (!isShopifyGid(cartId, 'Cart')) {
    return null;
  }
  const data = await storefrontRequest<CartQueryData>(
    CART_QUERY,
    { id: cartId },
    config,
  );
  if (!data.cart) {
    return null;
  }
  return mapShopifyCart(data.cart);
}

export async function createShopifyCart(
  lines: CartLineInput[] = [],
  config?: StorefrontConfig,
): Promise<MappedCart> {
  const data = await storefrontRequest<CartCreateData>(
    CART_CREATE_MUTATION,
    { input: lines.length > 0 ? { lines } : {} },
    config,
  );
  return mapShopifyCart(
    unwrapCartMutation(data.cartCreate, 'Shopify kunne ikke oprette kurven.'),
  );
}

export async function addShopifyCartLines(
  cartId: string | null,
  lines: CartLineInput[],
  config?: StorefrontConfig,
): Promise<MappedCart> {
  if (lines.length === 0) {
    throw new ShopifyStorefrontError('Der blev ikke sendt nogen varer til Shopify-kurven.');
  }
  if (!cartId) {
    return ensureShopifyCart(null, lines, config);
  }

  try {
    const data = await storefrontRequest<CartLinesAddData>(
      CART_LINES_ADD_MUTATION,
      { cartId, lines },
      config,
    );
    return mapShopifyCart(
      unwrapCartMutation(data.cartLinesAdd, 'Shopify kunne ikke tilføje varen til kurven.'),
    );
  } catch (error) {
    if (isStaleCartError(error)) {
      return ensureShopifyCart(null, lines, config);
    }
    throw error;
  }
}

export async function updateShopifyCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
  config?: StorefrontConfig,
): Promise<MappedCart> {
  const data = await storefrontRequest<CartLinesUpdateData>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines },
    config,
  );
  return mapShopifyCart(
    unwrapCartMutation(
      data.cartLinesUpdate,
      'Shopify kunne ikke opdatere antallet i kurven.',
    ),
  );
}

export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[],
  config?: StorefrontConfig,
): Promise<MappedCart> {
  const data = await storefrontRequest<CartLinesRemoveData>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
    config,
  );
  return mapShopifyCart(
    unwrapCartMutation(
      data.cartLinesRemove,
      'Shopify kunne ikke fjerne varen fra kurven.',
    ),
  );
}

export async function ensureShopifyCart(
  cartId: string | null,
  lines: CartLineInput[] = [],
  config?: StorefrontConfig,
): Promise<MappedCart> {
  if (cartId) {
    const existing = await fetchShopifyCart(cartId, config);
    if (existing) {
      return existing;
    }
  }

  if (!inFlightCreate) {
    inFlightCreate = createShopifyCart(lines, config).finally(() => {
      inFlightCreate = null;
    });
    return inFlightCreate;
  }

  const created = await inFlightCreate;
  if (lines.length === 0) {
    return created;
  }
  return addShopifyCartLines(created.cartId, lines, config);
}

export function resetCartCreateLock(): void {
  inFlightCreate = null;
}
