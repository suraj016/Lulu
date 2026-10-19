import { describe, expect, it } from 'vitest';
import { clampRange, validateContactForm } from '../utils/validation.ts';

describe('validation', () => {
  it('requires contact fields and a valid email', () => {
    expect(validateContactForm({ name: '', email: '', message: '' })).toEqual({
      name: 'Dette felt er påkrævet.',
      email: 'Dette felt er påkrævet.',
      message: 'Dette felt er påkrævet.',
    });
    expect(
      validateContactForm({
        name: 'Anna',
        email: 'ikke-en-mail',
        message: 'Hej',
      }).email,
    ).toBe('Skriv en gyldig e-mailadresse.');
  });

  it('keeps a price range ordered', () => {
    expect(clampRange(20000, 8000)).toEqual({ min: 8000, max: 20000 });
  });
});
