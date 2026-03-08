import { useRef, useState } from 'react'
import styles from './ContactUs.module.css'

const contactInfo = {
  tagline: 'Let’s start a conversation.',
  subtitle: 'Whether you have a project in mind or just want to say hello, we’d love to hear from you.',
  email: 'hello@anthroteach.com',
  phone: '+1 (000) 000-0000',
  address: 'Your City, Country',
}

export function ContactUs() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    // Placeholder: in production you’d POST to an API or form service
    setTimeout(() => setStatus('sent'), 800)
  }

  return (
    <section
      id="contact"
      className={styles.wrapper}
      aria-labelledby="contact-heading"
    >
      <div className={styles.gridOverlay} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.tag}>Get in touch</span>
          <h2 id="contact-heading" className={styles.title}>
            Contact Us
          </h2>
          <p className={styles.subtitle}>{contactInfo.subtitle}</p>
        </header>

        <div className={styles.content}>
          <div className={styles.info}>
            <p className={styles.tagline}>{contactInfo.tagline}</p>
            <ul className={styles.contactList} aria-label="Contact information">
              <li>
                <span className={styles.label}>Email</span>
                <a href={`mailto:${contactInfo.email}`} className={styles.link}>
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <span className={styles.label}>Phone</span>
                <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className={styles.link}>
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <span className={styles.label}>Address</span>
                <span className={styles.value}>{contactInfo.address}</span>
              </li>
            </ul>
          </div>

          <form
            ref={formRef}
            className={styles.form}
            onSubmit={handleSubmit}
            aria-label="Contact form"
            noValidate
          >
            <div className={styles.field}>
              <label htmlFor="contact-name" className={styles.label}>
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                className={styles.input}
                placeholder="Your name"
                required
                autoComplete="name"
                disabled={status === 'sending'}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-email" className={styles.label}>
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                className={styles.input}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={status === 'sending'}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-message" className={styles.label}>
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                className={styles.textarea}
                placeholder="Tell us about your project or question…"
                rows={5}
                required
                disabled={status === 'sending'}
              />
            </div>
            <button
              type="submit"
              className={styles.submit}
              disabled={status === 'sending'}
              aria-busy={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Message sent' : 'Send message'}
            </button>
            {status === 'error' && (
              <p className={styles.error} role="alert">
                Something went wrong. Please try again or email us directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
