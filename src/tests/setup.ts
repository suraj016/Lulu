import { collections } from '../data/mockCollections.ts';
import { allProducts } from '../data/mockProducts.ts';
import { replaceCatalog } from '../services/catalogStore.ts';

replaceCatalog({
  products: allProducts,
  collections,
  mappingIssues: [],
});
