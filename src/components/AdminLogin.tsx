import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './AdminLogin.module.css'

export function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    setStatus('submitting')
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const ok = login(email, password)
    if (ok) {
      navigate('/admin')
    } else {
      setStatus('error')
      setErrorMessage('Invalid email or password.')
    }
  }

  return (
    <section
      className={styles.wrapper}
      aria-labelledby="admin-login-heading"
    >
      <div className={styles.gridOverlay} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.tag}>Admin</span>
          <h1 id="admin-login-heading" className={styles.title}>
            Log in
          </h1>
          <p className={styles.subtitle}>
            Sign in to access the dashboard.
          </p>
        </header>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-label="Admin login form"
          noValidate
        >
          <div className={styles.field}>
            <label htmlFor="admin-email" className={styles.label}>
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              name="email"
              className={styles.input}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              disabled={status === 'submitting'}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              name="password"
              className={styles.input}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={status === 'submitting'}
            />
          </div>
          <button
            type="submit"
            className={styles.submit}
            disabled={status === 'submitting'}
            aria-busy={status === 'submitting'}
          >
            {status === 'submitting' ? 'Signing in…' : 'Sign in'}
          </button>
          {status === 'error' && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}
        </form>

        <Link to="/" className={styles.backLink}>
          ← Back to site
        </Link>
      </div>
    </section>
  )
}
