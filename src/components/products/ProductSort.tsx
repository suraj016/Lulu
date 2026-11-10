import { messages } from '../../data/messages.ts';
import { SortKey } from '../../types/product.ts';
import styles from './ProductSort.module.css';

const options: Array<{ value: SortKey; label: string }> = [
  { value: SortKey.Popular, label: messages.catalog.sortPopular },
  { value: SortKey.PriceAsc, label: messages.catalog.sortPriceAsc },
  { value: SortKey.PriceDesc, label: messages.catalog.sortPriceDesc },
  { value: SortKey.Newest, label: messages.catalog.sortNewest },
  { value: SortKey.NameAsc, label: messages.catalog.sortName },
];

export function ProductSort({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <label className={styles.label}>
      <span className="visually-hidden">{messages.catalog.sort}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
        className="control"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
