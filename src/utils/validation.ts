import { messages } from '../data/messages.ts';

export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(input: {
  name: string;
  email: string;
  message: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.name.trim()) {
    errors.name = messages.contact.required;
  }

  if (!input.email.trim()) {
    errors.email = messages.contact.required;
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = messages.contact.invalidEmail;
  }

  if (!input.message.trim()) {
    errors.message = messages.contact.required;
  }

  return errors;
}

export function clampRange(min: number, max: number): { min: number; max: number } {
  if (min > max) {
    return { min: max, max: min };
  }
  return { min, max };
}
