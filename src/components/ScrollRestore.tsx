import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useLenis } from 'lenis/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * On every route change: scroll to top, then tell Lenis and ScrollTrigger
 * to recalculate so the new page opens correctly (avoids "stuck" or wrong height).
 */
export function ScrollRestore() {
  const { pathname } = useLocation()
  const lenis = useLenis()
  const prevPathRef = useRef(pathname)

  useEffect(() => {
    if (prevPathRef.current === pathname) return
    prevPathRef.current = pathname

    // 1. Reset scroll immediately so the new page starts at top
    window.scrollTo(0, 0)
    lenis?.scrollTo(0, { immediate: true })

    // 2. After the new route has painted, recalculate so Lenis/ScrollTrigger match the new content
    const raf = requestAnimationFrame(() => {
      lenis?.resize()
      ScrollTrigger.clearScrollMemory()
      ScrollTrigger.refresh()
    })
    return () => cancelAnimationFrame(raf)
  }, [pathname, lenis])

  return null
}
