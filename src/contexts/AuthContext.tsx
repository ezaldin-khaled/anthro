import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

const AUTH_STORAGE_KEY = 'anthro_admin_auth'

const MOCK_EMAIL = 'admin@anthro.com'
const MOCK_PASSWORD = 'admin123'

type AuthContextValue = {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStored(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStored)

  const login = useCallback((email: string, password: string) => {
    const ok = email === MOCK_EMAIL && password === MOCK_PASSWORD
    if (ok) {
      setIsAuthenticated(true)
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      } catch {}
    }
    return ok
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
