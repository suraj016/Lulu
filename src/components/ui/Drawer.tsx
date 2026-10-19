import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import { IconButton } from './IconButton.tsx';
import styles from './Drawer.module.css';

type DrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  side?: 'right' | 'left';
};

export function Drawer({
  open,
  title,
  onClose,
  children,
  side = 'right',
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div
        className={`${styles.panel} ${side === 'left' ? styles.left : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton label={messages.actions.close} onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </>
  );
}
