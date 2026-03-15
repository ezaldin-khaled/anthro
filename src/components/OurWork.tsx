import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import styles from './OurWork.module.css'

import ganImg from '../../Assets/gan.png'
import chocolocoImg from '../../Assets/chocoloco.png'
import clickExpriceImg from '../../Assets/click-exprice.png'

gsap.registerPlugin(ScrollTrigger)

const workContent = {
  tag: 'Latest work',
  title: 'Our Work',
  subtitle: 'A selection of our main projects.',
  items: [
    {
      client: 'GANTClub',
      category: 'Platform',
      title: 'Gan',
      description: 'Where your talent meets real opportunities. Professional portfolio, visibility, and talent matching.',
      image: ganImg,
    },
    {
      client: 'Premium Chocolates',
      category: 'E‑commerce',
      title: 'Chocoloco',
      description: 'Sweets crafted for wholesale partners worldwide. Browse by category and explore products.',
      image: chocolocoImg,
    },
    {
      client: 'Logistics',
      category: 'Web & Development',
      title: 'Click Exprice',
      description: "Let's move your business forward. Services, fleet, and shipping solutions.",
      image: clickExpriceImg,
    },
  ],
}

export function OurWork() {
  const sectionRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const arrowRef = useRef<SVGGElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    const section = sectionRef.current
    const path = pathRef.current
    const arrow = arrowRef.current
    if (!section || !path || !arrow) return

    let trigger: ScrollTrigger | null = null
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const FADE_START = 0.03
    const FADE_END = 0.97

    const updateArrow = (progress: number) => {
      const len = path.getTotalLength()
      if (len <= 0) return
      const delta = Math.min(2, len * 0.01)
      const t = Math.min(progress * len, len)
      const point = path.getPointAtLength(t)
      const nextT = Math.min(t + delta, len)
      const next = path.getPointAtLength(nextT)
      const angleRad = Math.atan2(next.y - point.y, next.x - point.x)
      const angleDeg = (angleRad * 180) / Math.PI
      arrow.setAttribute(
        'transform',
        `translate(${point.x},${point.y}) rotate(${angleDeg})`
      )
      // Hide cursor at start and end of motion with smooth fade
      let opacity = 1
      if (progress <= FADE_START) {
        opacity = progress / FADE_START
      } else if (progress >= FADE_END) {
        opacity = (1 - progress) / (1 - FADE_END)
      }
      arrow.setAttribute('opacity', String(opacity))
    }

    const setup = () => {
      const len = path.getTotalLength()
      if (len <= 0) return true // retry

      updateArrow(0)

      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => updateArrow(self.progress),
      })

      ScrollTrigger.refresh()
      updateArrow(trigger.progress)

      const onScroll = () => {
        if (trigger) updateArrow(trigger.progress)
      }
      lenis?.on('scroll', onScroll)
      return () => {
        lenis?.off('scroll', onScroll)
      }
    }

    let teardown: (() => void) | undefined

    const trySetup = () => {
      if (trigger) return
      const result = setup()
      if (typeof result === 'function') teardown = result
      else if (result === true) {
        timeouts.push(setTimeout(trySetup, 100))
        timeouts.push(setTimeout(trySetup, 400))
      }
    }

    timeouts.push(setTimeout(trySetup, 0))
    timeouts.push(setTimeout(() => {
      ScrollTrigger.refresh()
      if (trigger) updateArrow(trigger.progress)
    }, 300))

    return () => {
      timeouts.forEach((id) => clearTimeout(id))
      teardown?.()
      if (trigger) trigger.kill()
    }
  }, [lenis])

  return (
    <section
      ref={sectionRef}
      id="work"
      className={styles.wrapper}
      aria-labelledby="work-heading"
      aria-label="Our Work"
    >
      <div className={styles.gridOverlay} aria-hidden />

      {/* Hidden track: arrow follows this path, driven by scroll */}
      <svg
        className={styles.motionPath}
        viewBox="0 0 400 1200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          {/* Border gradient: pale yellow-orange (tail) → vibrant orange (tip), neon feel */}
          <linearGradient id="borderGrad" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="4" y2="0">
            <stop offset="0%" stopColor="#FFD699" />
            <stop offset="35%" stopColor="#FFB366" />
            <stop offset="70%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#FF7700" />
          </linearGradient>
          {/* Neon glow – luminous halo around the border */}
          <filter id="arrowGlow" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood floodColor="#FF9933" floodOpacity="0.85" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          ref={pathRef}
          className={styles.pathTrack}
          d="M 60 0 C 60 200, 340 200, 340 400 C 340 600, 60 600, 60 800 C 60 1000, 340 1000, 340 1200"
          fill="none"
        />
        <g ref={arrowRef} className={styles.arrow} filter="url(#arrowGlow)">
          {/* Neon glow layer – thick stroke blurs into luminous halo */}
          <path
            d="M 0 0 L -30 -12 L -30 12 L 0 0 Z"
            fill="none"
            stroke="url(#borderGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Solid black cursor body */}
          <path
            d="M 0 0 L -28 -11.5 L -28 11.5 Z"
            fill="#0a0a0a"
            stroke="none"
          />
          {/* Thick neon border – gradient orange, rounded edges */}
          <path
            d="M 0 0 L -28 -11.5 L -28 11.5 Z"
            fill="none"
            stroke="url(#borderGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.tag}>{workContent.tag}</span>
          <h2 id="work-heading" className={styles.title}>
            {workContent.title}
          </h2>
          <p className={styles.subtitle}>{workContent.subtitle}</p>
        </header>

        <ul className={styles.grid} aria-label="Latest projects">
          {workContent.items.map((item, i) => (
            <li key={i} className={styles.card}>
              <div className={styles.cardImageWrap}>
                {item.image ? (
                  <img src={item.image} alt="" className={styles.cardImage} aria-hidden />
                ) : (
                  <div className={styles.cardImage} aria-hidden />
                )}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.cardCategory}>{item.category}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <span className={styles.cardClient}>{item.client}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
