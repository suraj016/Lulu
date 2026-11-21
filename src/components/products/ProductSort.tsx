import { DropdownSelect } from '../ui/DropdownSelect.tsx';
import { messages } from '../../data/messages.ts';
import { SortKey } from '../../types/product.ts';

const options = [
  { value: SortKey.Popular, label: messages.catalog.sortPopular },
  { value: SortKey.PriceAsc, label: messages.catalog.sortPriceAsc },
  { value: SortKey.PriceDesc, label: messages.catalog.sortPriceDesc },
  { value: SortKey.Newest, label: messages.catalog.sortNewest },
  { value: SortKey.NameAsc, label: messages.catalog.sortName },
] as const;

export function ProductSort({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <DropdownSelect
      value={value}
      options={options}
      onChange={onChange}
      ariaLabel={messages.catalog.sort}
      menuAlign="end"
      minTriggerWidth="12.5rem"
    />
  );
}