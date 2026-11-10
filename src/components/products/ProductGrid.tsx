import type { Product } from '../../types/product.ts';
import { messages } from '../../data/messages.ts';
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

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.grid} aria-busy="true">
      <p className="visually-hidden" aria-live="polite">
        {messages.catalog.loading}
      </p>
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.skeletonCard} key={index}>
          <div className={styles.skeletonMedia} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonPrice} />
        </div>
      ))}
    </div>
  );
}
