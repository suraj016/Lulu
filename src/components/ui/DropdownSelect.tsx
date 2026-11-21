import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './DropdownSelect.module.css';

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type DropdownSelectProps<T extends string> = {
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  menuAlign?: 'start' | 'end';
  className?: string;
  minTriggerWidth?: string;
};

export function DropdownSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  menuAlign = 'end',
  className,
  minTriggerWidth = '12.5rem',
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const rootClass = [
    styles.root,
    menuAlign === 'start' ? styles.alignStart : styles.alignEnd,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        style={{ minWidth: minTriggerWidth }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? menuId : undefined}
        aria-label={`${ariaLabel}: ${current?.label ?? ''}`}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className={styles.triggerLabel}>{current?.label}</span>
        <ChevronDown
          className={
            open ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron
          }
          size={18}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ul
          className={styles.menu}
          id={menuId}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  className={selected ? styles.optionActive : styles.option}
                  onClick={() => {
                    if (option.disabled) {
                      return;
                    }
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}