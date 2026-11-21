import flowers from '../../assets/Front/flowers.png';
import graphicDesigner from '../../assets/Front/graphic-designer.png';
import tracking from '../../assets/Front/tracking.png';
import flag from '../../assets/Shop/flag.png';
import { messages } from '../../data/messages.ts';
import type { aboutValues } from '../../data/mockContent.ts';
import styles from './AboutPage.module.css';

export type AboutValueArtId = (typeof aboutValues)[number]['icon'];

const aboutValueArt: Record<
  AboutValueArtId,
  { src: string; alt: string; crop?: 'flag' }
> = {
  flag: {
    src: flag,
    alt: messages.about.values.production,
    crop: 'flag',
  },
  graphicDesign: {
    src: graphicDesigner,
    alt: messages.about.values.designs,
  },
  flowers: {
    src: flowers,
    alt: messages.about.values.care,
  },
  tracking: {
    src: tracking,
    alt: messages.about.values.details,
  },
};

export function AboutValueArt({ id }: { id: AboutValueArtId }) {
  const art = aboutValueArt[id];
  const imageClass = [styles.valueArt, art.crop ? styles.valueArtFlag : '']
    .filter(Boolean)
    .join(' ');

  return (
    <img
      className={imageClass}
      src={art.src}
      alt=""
      width={256}
      height={256}
      decoding="async"
      draggable={false}
      aria-hidden="true"
    />
  );
}