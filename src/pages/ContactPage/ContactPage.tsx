import { useState } from 'react';
import { editorialAssets } from '../../assets/manifest.ts';
import { Button } from '../../components/ui/Button.tsx';
import { SafeImage } from '../../components/ui/SafeImage.tsx';
import { messages } from '../../data/messages.ts';
import { validateContactForm, type FieldErrors } from '../../utils/validation.ts';
import styles from './ContactPage.module.css';

export function ContactPage() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.copy}>
        <p className="eyebrow">{messages.contact.eyebrow}</p>
        <h1>
          {messages.contact.headingLead}{' '}
          <span className="accent">{messages.contact.headingAccent}</span>
        </h1>
        <p>{messages.contact.body}</p>
        <div className={styles.card}>
          <p>{messages.contact.emailLabel}</p>
          <a href={`mailto:${messages.contact.email}`}>{messages.contact.email}</a>
        </div>
        <p className={styles.note}>skriv endelig</p>

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors = validateContactForm(values);
            setErrors(nextErrors);
            setSubmitted(Object.keys(nextErrors).length === 0);
          }}
          noValidate
        >
          <label>
            {messages.contact.formName}
            <input
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              autoComplete="name"
            />
            {errors.name ? <span className={styles.error}>{errors.name}</span> : null}
          </label>
          <label>
            {messages.contact.formEmail}
            <input
              type="email"
              value={values.email}
              onChange={(event) =>
                setValues((current) => ({ ...current, email: event.target.value }))
              }
              autoComplete="email"
            />
            {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
          </label>
          <label>
            {messages.contact.formMessage}
            <textarea
              value={values.message}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
            />
            {errors.message ? (
              <span className={styles.error}>{errors.message}</span>
            ) : null}
          </label>
          <p>{messages.contact.formHint}</p>
          <Button type="submit">{messages.actions.submit}</Button>
          {submitted ? (
            <p className={styles.status} role="status">
              {messages.contact.formSubmitted}
            </p>
          ) : null}
        </form>
      </div>
      <div className={styles.media}>
        <SafeImage
          src={editorialAssets.contactHero.src}
          alt={editorialAssets.contactHero.alt}
          loading="eager"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
