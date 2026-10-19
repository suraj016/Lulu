import { useState } from 'react';

type SafeImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
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
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? FALLBACK : src;

  return (
    <img
      className={className}
      src={resolved}
      alt={failed ? `${alt} (pladsholder)` : alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
    />
  );
}
