import { motion } from 'framer-motion'

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
              <motion.a
                href={href}
                className="text-[0.9375rem] font-medium tracking-[0.045em] text-[var(--text-secondary)] transition-opacity hover:opacity-100"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
