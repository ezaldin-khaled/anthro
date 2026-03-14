import styles from './Header.module.css'

const navLinks = [
  { label: 'WORK', href: '#work' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
]

export function Header() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-6 py-5 md:px-10 md:py-6"
      aria-label="Site header"
    >
      <a
        href="#hero"
        className="flex items-center gap-2 transition-opacity hover:opacity-90"
        aria-label="AnthroTeach – Home"
      >
        <img
          src="/Assets/white-logo.png"
          alt="AnthroTeach"
          className="h-8 w-auto md:h-9"
        />
      </a>
      <nav className="flex items-center" aria-label="Main navigation">
        <ul className="flex list-none items-center gap-6 md:gap-8">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={styles.navLinkInteractive}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
