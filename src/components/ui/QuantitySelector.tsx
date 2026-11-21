import { Minus, Plus } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import styles from './QuantitySelector.module.css';

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  id?: string;
  ariaLabelledBy?: string;
  className?: string;
};

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  disabled = false,
  onChange,
  id,
  ariaLabelledBy,
  className,
}: QuantitySelectorProps) {
  const current = normalizeQuantity(value, min);
  const limit = normalizeQuantity(max, min);

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      role="group"
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabelledBy ? undefined : messages.product.quantity}
    >
      <button
        className={styles.button}
        type="button"
        aria-label={messages.product.decreaseQuantity}
        disabled={disabled || current <= min}
        onClick={(event) => {
          event.stopPropagation();
          onChange(Math.max(min, current - 1));
        }}
      >
        <Minus size={16} />
      </button>
      <span className={styles.value} id={id} aria-live="polite">
        <span className="visually-hidden">{messages.product.quantity}: </span>
        {current}
      </span>
      <button
        className={styles.button}
        type="button"
        aria-label={messages.product.increaseQuantity}
        disabled={disabled || current >= limit}
        onClick={(event) => {
          event.stopPropagation();
          onChange(Math.min(limit, current + 1));
        }}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function normalizeQuantity(value: number, min: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return min;
  }
  return Math.max(min, Math.floor(parsed));
}
