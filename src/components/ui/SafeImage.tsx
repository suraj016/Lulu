import { useState } from 'react';
import { shopifyImageUrl } from '../../utils/imageUrl.ts';

type SafeImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  displayWidth?: number;
  sizes?: string;
};

const FALLBACK = '/placeholders/products/fallback.svg';

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  fetchPriority,
  displayWidth,
  sizes,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? FALLBACK : shopifyImageUrl(src, displayWidth);

  return (
    <img
      className={className}
      src={resolved}
      alt={failed ? `${alt} (pladsholder)` : alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={loading === 'eager' ? 'sync' : 'async'}
      onError={() => setFailed(true)}
    />
  );
}
