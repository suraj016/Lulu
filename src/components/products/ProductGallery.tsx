import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { messages } from '../../data/messages.ts';
import type { ProductImage } from '../../types/product.ts';
import { IconButton } from '../ui/IconButton.tsx';
import { Modal } from '../ui/Modal.tsx';
import { SafeImage } from '../ui/SafeImage.tsx';
import styles from './ProductGallery.module.css';

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const current = images[index] ?? images[0];

  if (!current) {
    return (
      <div className={styles.mainWrap}>
        <SafeImage src="/placeholders/products/fallback.svg" alt={messages.imageMissing} />
      </div>
    );
  }

  const go = (next: number) => {
    if (images.length === 0) {
      return;
    }
    setIndex((next + images.length) % images.length);
  };

  return (
    <>
      <div className={styles.layout}>
        <div className={styles.thumbs} role="tablist" aria-label="Produktbilleder">
          {images.map((image, imageIndex) => (
            <button
              className={styles.thumb}
              type="button"
              key={image.id}
              data-active={imageIndex === index ? 'true' : 'false'}
              onClick={() => setIndex(imageIndex)}
              aria-label={image.alt}
            >
              <SafeImage src={image.src} alt="" width={90} height={90} />
            </button>
          ))}
        </div>
        <div className={styles.mainWrap}>
          <button
            className={styles.mainButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-label={messages.actions.expandImage}
          >
            <SafeImage
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              loading="eager"
              fetchPriority="high"
            />
          </button>
          {images.length > 1 ? (
            <>
              <button
                className={`${styles.nav} ${styles.prev}`}
                type="button"
                aria-label={messages.actions.previous}
                onClick={() => go(index - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className={`${styles.nav} ${styles.next}`}
                type="button"
                aria-label={messages.actions.next}
                onClick={() => go(index + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </>
          ) : null}
          <IconButton
            className={styles.expand}
            label={messages.actions.expandImage}
            onClick={() => setOpen(true)}
          >
            <Expand size={16} />
          </IconButton>
        </div>
      </div>
      <Modal open={open} title={current.alt} onClose={() => setOpen(false)}>
        <SafeImage
          className={styles.lightboxImage}
          src={current.src}
          alt={current.alt}
        />
        {images.length > 1 ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button type="button" onClick={() => go(index - 1)}>
              {messages.actions.previous}
            </button>
            <button type="button" onClick={() => go(index + 1)}>
              {messages.actions.next}
            </button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
