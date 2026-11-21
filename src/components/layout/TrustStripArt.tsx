import brainstorm from '../../assets/Shop/brainstorm.png';
import fastDelivery from '../../assets/Shop/fast-delivery.png';
import flag from '../../assets/Shop/flag.png';
import plant from '../../assets/Shop/plant.png';
import { messages } from '../../data/messages.ts';
import styles from './TrustStrip.module.css';

export type TrustArtId = 'materials' | 'designs' | 'delivery' | 'danish';

const trustArt: Record<
  TrustArtId,
  { src: string; alt: string; width: number; height: number }
> = {
  materials: {
    src: plant,
    alt: messages.trust.materials,
    width: 256,
    height: 256,
  },
  designs: {
    src: brainstorm,
    alt: messages.trust.designs,
    width: 256,
    height: 256,
  },
  delivery: {
    src: fastDelivery,
    alt: messages.trust.delivery,
    width: 256,
    height: 256,
  },
  danish: {
    src: flag,
    alt: messages.trust.danish,
    width: 256,
    height: 256,
  },
};

export function resolveTrustArtId(itemId: string): TrustArtId {
  if (itemId === 'pla') {
    return 'materials';
  }
  return itemId as TrustArtId;
}

type TrustStripArtProps = {
  id: TrustArtId;
  className?: string;
};

export function TrustStripArt({ id, className }: TrustStripArtProps) {
  const art = trustArt[id];

  return (
    <img
      className={className ?? styles.stripArt}
      src={art.src}
      alt=""
      width={art.width}
      height={art.height}
      decoding="async"
      draggable={false}
      aria-hidden="true"
    />
  );
}