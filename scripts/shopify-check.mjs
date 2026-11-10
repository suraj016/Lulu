import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');

if (!fs.existsSync(envPath)) {
  console.error('Mangler .env i projektroden.');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const domain = env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
const apiVersion = env.VITE_SHOPIFY_STOREFRONT_API_VERSION?.trim();
const token = env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim();

if (!domain || !apiVersion || !token) {
  console.error(
    'Mangler VITE_SHOPIFY_STORE_DOMAIN, VITE_SHOPIFY_STOREFRONT_API_VERSION eller VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN.',
  );
  process.exit(1);
}

const query = `
  query StorefrontCatalog($first: Int!) {
    products(first: $first) {
      pageInfo { hasNextPage }
      nodes {
        id
        title
        handle
        productType
        tags
        availableForSale
      }
    }
    collections(first: $first) {
      pageInfo { hasNextPage }
      nodes {
        handle
        title
        products(first: $first) {
          pageInfo { hasNextPage }
          nodes { id title handle }
        }
      }
    }
  }
`;

const endpoint = `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/api/${apiVersion}/graphql.json`;
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query, variables: { first: 50 } }),
});

let payload;
try {
  payload = await response.json();
} catch {
  console.error(`Shopify svarede med ugyldig JSON (HTTP ${response.status}).`);
  process.exit(1);
}

if (!response.ok || payload.errors?.length) {
  const messages = (payload.errors ?? [])
    .map((error) => error.message)
    .filter(Boolean)
    .join(' ');
  console.error(
    `Shopify Storefront-forbindelse fejlede (HTTP ${response.status}).${messages ? ` ${messages}` : ''}`,
  );
  process.exit(1);
}

const products = payload.data?.products?.nodes ?? [];
const collections = payload.data?.collections?.nodes ?? [];
const membership = new Map();
for (const collection of collections) {
  for (const product of collection.products?.nodes ?? []) {
    const handles = membership.get(product.id) ?? [];
    handles.push(collection.handle);
    membership.set(product.id, handles);
  }
}

console.log('Shopify Storefront: OK');
console.log(`Produkter hentet: ${products.length}`);
console.log(`Kollektioner hentet: ${collections.length}`);
if (payload.data?.products?.pageInfo?.hasNextPage) {
  console.log(
    'Advarsel: produktlisten har flere sider end dette tjek henter. Storefront-appen paginerer op til 500.',
  );
}
if (payload.data?.collections?.pageInfo?.hasNextPage) {
  console.log(
    'Advarsel: kollektionlisten har flere sider end dette tjek henter.',
  );
}
console.log('');
console.log('Kollektioner:');
for (const collection of collections) {
  const count = collection.products?.nodes?.length ?? 0;
  const more = collection.products?.pageInfo?.hasNextPage ? '+' : '';
  console.log(`- ${collection.title} [${collection.handle}] (${count}${more} produkter)`);
}

console.log('');
console.log('Produkter:');
let missingType = 0;
let missingTags = 0;
let withoutCollections = 0;
for (const product of products) {
  const availability = product.availableForSale ? 'på lager' : 'ikke tilgængelig';
  const collectionsForProduct = membership.get(product.id) ?? [];
  if (!product.productType) missingType += 1;
  if (!product.tags?.length) missingTags += 1;
  if (collectionsForProduct.length === 0) withoutCollections += 1;
  const collectionLabel =
    collectionsForProduct.length > 0 ? collectionsForProduct.join(', ') : 'ingen kollektion';
  console.log(
    `- ${product.title} [${product.handle}] (${availability}; type="${product.productType || 'tom'}"; ${collectionLabel})`,
  );
}

console.log('');
console.log('Manglende Shopify-data:');
console.log(`- Produkter uden productType: ${missingType}`);
console.log(`- Produkter uden tags: ${missingTags}`);
console.log(`- Produkter uden kollektion: ${withoutCollections}`);
