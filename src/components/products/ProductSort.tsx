import { messages } from '../../data/messages.ts';
import { SortKey } from '../../types/product.ts';

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
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <span className="visually-hidden">{messages.catalog.sort}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
        style={{
          minHeight: '2.6rem',
          padding: '0.45rem 0.8rem',
          borderRadius: '999px',
          border: '1px solid var(--color-divider)',
          background: 'var(--color-surface)',
        }}
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
