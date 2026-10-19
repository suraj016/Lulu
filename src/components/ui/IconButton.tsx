import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  badge?: number;
  children: ReactNode;
};

export function IconButton({
  label,
  badge,
  children,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={[styles.button, className ?? ''].filter(Boolean).join(' ')}
      type={type}
      aria-label={label}
      {...props}
    >
      {children}
      {typeof badge === 'number' && badge > 0 ? (
        <span className={styles.badge} aria-hidden="true">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  );
}
