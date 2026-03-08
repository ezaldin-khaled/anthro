const placeholderLogos = [
  'FAD333',
  'CSEOR',
  'RS',
  'CMN',
  '01100',
  'MORRION',
  'LON',
  'ANTHRO',
]

export function HeroLogos() {
  return (
    <section
      className="overflow-hidden border-t border-[var(--border-subtle)] py-9"
      style={{ background: 'var(--bg-mid)' }}
      aria-label="Trusted by"
    >
      <div className="flex w-max animate-scroll-logos items-center gap-14">
        {[...placeholderLogos, ...placeholderLogos].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="shrink-0 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}
