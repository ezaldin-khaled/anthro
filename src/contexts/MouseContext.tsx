import { createContext, useRef, type ReactNode } from 'react'

export type MouseRef = {
  current: {
    deltaX: number
    deltaY: number
    x: number
    y: number
  }
}

const MouseContext = createContext<MouseRef | null>(null)

export function MouseProvider({ children }: { children: ReactNode }) {
  const ref = useRef({ deltaX: 0, deltaY: 0, x: 0, y: 0 })

  return (
    <MouseContext.Provider value={ref}>
      {children}
    </MouseContext.Provider>
  )
}

export { MouseContext }
