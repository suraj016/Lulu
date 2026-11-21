const LETTER_SIZES: Record<string, string> = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  XL: 'X-Large',
  XXL: 'XX-Large',
};

/** Human-readable size for PDP chips (e.g. S → Small). */
export function formatVariantSize(size?: string, fallbackLabel?: string) {
  if (fallbackLabel?.trim()) {
    return fallbackLabel.trim();
  }
  if (!size) {
    return '';
  }
  const trimmed = size.trim();
  return LETTER_SIZES[trimmed] ?? trimmed;
}