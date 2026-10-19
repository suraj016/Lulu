import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ink';

type Common = {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
};

type ButtonAsButton = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    to?: undefined;
  };

type ButtonAsLink = Common & {
  to: string;
  onClick?: () => void;
};

export function Button({
  children,
  variant = 'primary',
  fullWidth,
  className,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = [
    styles.button,
    styles[variant],
    fullWidth ? styles.full : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if ('to' in props && props.to) {
    const { to, onClick } = props;
    return (
      <Link className={classes} to={to} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} type={buttonProps.type ?? 'button'} {...buttonProps}>
      {children}
    </button>
  );
}
