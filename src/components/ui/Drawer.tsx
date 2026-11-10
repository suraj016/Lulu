import { useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import { useFocusTrap } from '../../hooks/useFocusTrap.ts';
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
  useFocusTrap(panelRef, open, onClose);

  return (
    <>
      <div
        className={styles.backdrop}
        data-open={open ? 'true' : 'false'}
        onClick={onClose}
      />
      <div
        className={`${styles.panel} ${side === 'left' ? styles.left : ''}`}
        data-open={open ? 'true' : 'false'}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
        inert={!open}
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
