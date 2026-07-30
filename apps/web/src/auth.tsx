import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { apiRequest, ApiError } from './api'
import type { AuthResponse, User } from './types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setUser(await apiRequest<User>('/api/auth/me'))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null)
        return
      }
      throw error
    }
  }, [])

  useEffect(() => {
    void refresh().finally(() => setLoading(false))
  }, [refresh])

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    setUser(response.user)
    return response.user
  }, [])

  const logout = useCallback(async () => {
    await apiRequest<void>('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export function isAdmin(user: User | null) {
  return user?.roles.some((role) => role.code === 'ADMIN') ?? false
}

