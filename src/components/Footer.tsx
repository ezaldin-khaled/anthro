import styles from './Footer.module.css'

const footerLinks = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.wrapper} role="contentinfo" aria-label="Site footer">
      <div className={styles.gridOverlay} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.top}>
          <a href="#hero" className={styles.logoLink} aria-label="AnthroTeach – Home">
            <img
              src="/Assets/white-logo.png"
              alt=""
              className={styles.logo}
              width={120}
              height={40}
            />
          </a>
          <nav className={styles.nav} aria-label="Footer navigation">
            <ul className={styles.navList}>
              {footerLinks.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className={styles.navLink}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} AnthroTeach. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
