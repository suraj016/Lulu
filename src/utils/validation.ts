export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(input: {
  name: string;
  email: string;
  message: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.name.trim()) {
    errors.name = 'Dette felt er påkrævet.';
  }

  if (!input.email.trim()) {
    errors.email = 'Dette felt er påkrævet.';
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = 'Skriv en gyldig e-mailadresse.';
  }

  if (!input.message.trim()) {
    errors.message = 'Dette felt er påkrævet.';
  }

  return errors;
}

export function clampRange(min: number, max: number): { min: number; max: number } {
  if (min > max) {
    return { min: max, max: min };
  }
  return { min, max };
}
