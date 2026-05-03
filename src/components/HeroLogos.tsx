import clickExpressLogo from '../../Assets/Untitled design (99).png'
import senseLogo from '../../Assets/SENSE 1.png'
import chocoLogo from '../../Assets/CHOCO 1.png'
import gan7ClubLogo from '../../Assets/Untitled_design-removebg-preview.png'

const defaultImgClass =
  'h-14 w-auto max-w-[min(100vw,16rem)] shrink-0 object-contain sm:h-16 md:h-[4.5rem]'

const partnerLogos = [
  { src: clickExpressLogo, alt: 'Click Express Transport & Storage' },
  { src: senseLogo, alt: 'SENSE' },
  { src: chocoLogo, alt: 'Choco' },
  {
    src: gan7ClubLogo,
    alt: 'GAN7Club',
    /** Wide wordmark: tighter cap so it matches visual weight of taller marks */
    imgClassName:
      'h-10 w-auto max-w-[min(100vw,10.5rem)] shrink-0 object-contain sm:h-11 sm:max-w-[11.5rem] md:h-12 md:max-w-[13rem]',
  },
] as const

type LogoEntry = (typeof partnerLogos)[number]

function logoImgClass(logo: LogoEntry) {
  return 'imgClassName' in logo && logo.imgClassName ? logo.imgClassName : defaultImgClass
}

export function HeroLogos() {
  const items = [...partnerLogos, ...partnerLogos]

  return (
    <section
      className="overflow-hidden border-t border-[var(--border-subtle)] py-9"
      style={{ background: 'var(--bg-mid)' }}
      aria-label="Trusted by"
    >
      <div className="flex w-max animate-scroll-logos items-center gap-24 md:gap-32">
        {items.map((logo, i) => (
          <img
            key={`${logo.alt}-${i}`}
            src={logo.src}
            alt={logo.alt}
            className={logoImgClass(logo)}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </section>
  )
}
