import { Minus, Plus } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import styles from './QuantitySelector.module.css';

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  id?: string;
};

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  id,
}: QuantitySelectorProps) {
  return (
    <div className={styles.wrap}>
      <button
        className={styles.button}
        type="button"
        aria-label="Mindsk antal"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} />
      </button>
      <span className={styles.value} id={id} aria-live="polite">
        <span className="visually-hidden">{messages.product.quantity}: </span>
        {value}
      </span>
      <button
        className={styles.button}
        type="button"
        aria-label="Øg antal"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
