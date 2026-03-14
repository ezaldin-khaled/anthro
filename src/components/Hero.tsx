import { useRef, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { HeroScene } from './HeroScene'
import { MouseContext } from '../contexts/MouseContext'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const mouseRef = useContext(MouseContext)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || !mouseRef) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height * 2 - 1)
    }

    const onLeave = () => {
      mouseRef.current.x = 0
      mouseRef.current.y = 0
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [mouseRef])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen min-h-[100dvh] items-center overflow-hidden px-6 pb-20 pt-28 md:px-12 md:pb-24 md:pt-32"
      style={{ background: 'var(--bg-gradient)' }}
      aria-label="AnthroTeach – Elevate. Innovate. Aspire."
    >
      {/* 3D canvas: full section, center-right; hover to interact with particles */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          className="h-full w-full"
        >
          <HeroScene />
        </Canvas>
      </div>

      {/* Hero content: left-aligned, overlaps 3D */}
      <div className="relative z-10 flex max-w-[38rem] flex-col items-start gap-2">
        <motion.h1
          className="breathing-glow font-black leading-[0.92] text-[var(--text-primary)] [-webkit-font-smoothing:antialiased]"
          style={{
            fontSize: 'clamp(3.75rem, 12vw, 7.5rem)',
            letterSpacing: '-0.035em',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          IGNITE
        </motion.h1>
        <motion.p
          className="mt-3 font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)]"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.375rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.55 }}
        >
          ELEVATE. INNOVATE. ASPIRE.
        </motion.p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <motion.a
            href="#contact"
            className="inline-block rounded-md border-2 border-[var(--accent)] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-[var(--bg-deep)] hover:shadow-[0_0_32px_var(--accent-glow)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact us
          </motion.a>
          <motion.a
            href="#contact"
            className="inline-block rounded-md bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--bg-deep)] transition-all duration-200 hover:shadow-[0_0_32px_var(--accent-glow)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Direct connection
          </motion.a>
        </div>
      </div>

      {/* Section nav arrows */}
      <nav
        className="absolute right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 md:right-8"
        aria-label="Section navigation"
      >
        <a
          href="#hero"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Previous section"
        >
          <ArrowUp />
        </a>
        <a
          href="#services"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Next section"
        >
          <ArrowDown />
        </a>
      </nav>
    </section>
  )
}

function ArrowUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  )
}
