import { categories } from '../../data/mockCategories.ts';
import {
  colorFilterOptions,
  materialFilterOptions,
} from '../../data/mockContent.ts';
import { messages } from '../../data/messages.ts';
import { ProductType, type CatalogQuery } from '../../types/product.ts';
import { formatMoney } from '../../utils/currency.ts';
import { clampRange } from '../../utils/validation.ts';
import { Button } from '../ui/Button.tsx';
import { ColorSwatch } from '../ui/ColorSwatch.tsx';
import styles from './ProductFilters.module.css';

type ProductFiltersProps = {
  query: CatalogQuery;
  bounds: { min: number; max: number };
  onChange: (next: CatalogQuery) => void;
  hideCategory?: boolean;
};

export function ProductFilters({
  query,
  bounds,
  onChange,
  hideCategory,
}: ProductFiltersProps) {
  const shopCategories = categories.filter((category) => {
    if (query.productType === ProductType.Printed3d) {
      return category.id !== 'sokker';
    }
    if (query.productType === ProductType.Socks) {
      return category.id === 'sokker';
    }
    return true;
  });

  const toggleColor = (id: string) => {
    const colors = query.colors.includes(id)
      ? query.colors.filter((item) => item !== id)
      : [...query.colors, id];
    onChange({ ...query, colors, page: 1 });
  };

  const toggleMaterial = (id: string) => {
    const materials = query.materials.includes(id)
      ? query.materials.filter((item) => item !== id)
      : [...query.materials, id];
    onChange({ ...query, materials, page: 1 });
  };

  return (
    <form className={styles.panel} onSubmit={(event) => event.preventDefault()}>
      {hideCategory ? null : (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>{messages.catalog.categories}</legend>
          <label className={styles.option}>
            <input
              type="radio"
              name="category"
              checked={!query.categoryId}
              onChange={() => onChange({ ...query, categoryId: undefined, page: 1 })}
            />
            {query.productType === ProductType.Printed3d
              ? messages.catalog.all3d
              : messages.catalog.allProducts}
          </label>
          {shopCategories.map((category) => (
            <label className={styles.option} key={category.id}>
              <input
                type="radio"
                name="category"
                checked={query.categoryId === category.id}
                onChange={() =>
                  onChange({ ...query, categoryId: category.id, page: 1 })
                }
              />
              {category.name}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{messages.catalog.price}</legend>
        <p>
          {messages.catalog.priceInterval(
            formatMoney(query.minPriceOre ?? bounds.min),
            formatMoney(query.maxPriceOre ?? bounds.max),
          )}
        </p>
        <div className={styles.range}>
          <label>
            Min. kr.
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={100}
              value={query.minPriceOre ?? bounds.min}
              onChange={(event) => {
                const rawMin = Number(event.target.value);
                const max = query.maxPriceOre ?? bounds.max;
                const next = clampRange(rawMin, max);
                onChange({
                  ...query,
                  minPriceOre: next.min,
                  maxPriceOre: next.max,
                  page: 1,
                });
              }}
            />
          </label>
          <label>
            Maks. kr.
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={100}
              value={query.maxPriceOre ?? bounds.max}
              onChange={(event) => {
                const rawMax = Number(event.target.value);
                const min = query.minPriceOre ?? bounds.min;
                const next = clampRange(min, rawMax);
                onChange({
                  ...query,
                  minPriceOre: next.min,
                  maxPriceOre: next.max,
                  page: 1,
                });
              }}
            />
          </label>
        </div>
        <div className={styles.rangeRow}>
          <label>
            Min
            <input
              type="number"
              inputMode="numeric"
              value={Math.round((query.minPriceOre ?? bounds.min) / 100)}
              onChange={(event) => {
                const kroner = Number(event.target.value);
                if (!Number.isFinite(kroner)) {
                  return;
                }
                const next = clampRange(kroner * 100, query.maxPriceOre ?? bounds.max);
                onChange({
                  ...query,
                  minPriceOre: next.min,
                  maxPriceOre: next.max,
                  page: 1,
                });
              }}
            />
          </label>
          <label>
            Maks
            <input
              type="number"
              inputMode="numeric"
              value={Math.round((query.maxPriceOre ?? bounds.max) / 100)}
              onChange={(event) => {
                const kroner = Number(event.target.value);
                if (!Number.isFinite(kroner)) {
                  return;
                }
                const next = clampRange(query.minPriceOre ?? bounds.min, kroner * 100);
                onChange({
                  ...query,
                  minPriceOre: next.min,
                  maxPriceOre: next.max,
                  page: 1,
                });
              }}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{messages.catalog.colors}</legend>
        <div className={styles.swatches}>
          {colorFilterOptions.map((color) => (
            <ColorSwatch
              key={color.id}
              label={color.label}
              hex={color.hex}
              selected={query.colors.includes(color.id)}
              onSelect={() => toggleColor(color.id)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{messages.catalog.material}</legend>
        {materialFilterOptions.map((material) => (
          <label className={styles.option} key={material.id}>
            <input
              type="checkbox"
              checked={query.materials.includes(material.id)}
              onChange={() => toggleMaterial(material.id)}
            />
            {material.label}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{messages.catalog.more}</legend>
        <label className={styles.option}>
          <input
            type="checkbox"
            checked={Boolean(query.isNew)}
            onChange={(event) =>
              onChange({
                ...query,
                isNew: event.target.checked ? true : undefined,
                page: 1,
              })
            }
          />
          {messages.catalog.newArrivals}
        </label>
        <label className={styles.option}>
          <input
            type="checkbox"
            checked={Boolean(query.inStock)}
            onChange={(event) =>
              onChange({
                ...query,
                inStock: event.target.checked ? true : undefined,
                page: 1,
              })
            }
          />
          {messages.catalog.inStock}
        </label>
      </fieldset>

      <Button
        variant="ghost"
        onClick={() =>
          onChange({
            ...query,
            categoryId: undefined,
            minPriceOre: undefined,
            maxPriceOre: undefined,
            colors: [],
            materials: [],
            isNew: undefined,
            inStock: undefined,
            query: undefined,
            page: 1,
          })
        }
      >
        {messages.actions.resetFilters}
      </Button>
    </form>
  );
}
