import { useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import { useFocusTrap } from '../../hooks/useFocusTrap.ts';
import { IconButton } from './IconButton.tsx';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, onClose);

  return (
    <div
      className={styles.backdrop}
      data-open={open ? 'true' : 'false'}
      onClick={onClose}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
        inert={!open}
        onClick={(event) => event.stopPropagation()}
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
    </div>
  );
}
