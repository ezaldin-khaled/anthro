import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

const TOKEN_STORAGE_KEY = 'anthro_admin_token'
const API = '/api'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  }, [])

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    validateToken(token)
      .then((ok) => {
        setIsAuthenticated(ok)
        if (!ok) setStoredToken(null)
      })
      .catch(() => {
        setStoredToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [validateToken])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok || !data.token) {
      return false
    }
    setStoredToken(data.token)
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
