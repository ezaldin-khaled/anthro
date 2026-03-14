import { useLocation } from 'react-router-dom'

/**
 * Wraps route content so it fades in on every navigation (key = pathname).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
