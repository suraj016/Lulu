import type { Product } from '../../types/product.ts';
import { ProductCard } from './ProductCard.tsx';
import styles from './ProductGrid.module.css';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
