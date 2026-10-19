import styles from './ColorSwatch.module.css';

type ColorSwatchProps = {
  label: string;
  hex: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function ColorSwatch({
  label,
  hex,
  selected,
  disabled,
  onSelect,
}: ColorSwatchProps) {
  return (
    <button
      className={styles.swatch}
      type="button"
      aria-label={label}
      aria-pressed={selected}
      data-selected={selected ? 'true' : 'false'}
      disabled={disabled}
      style={{ backgroundColor: hex }}
      onClick={onSelect}
    />
  );
}
