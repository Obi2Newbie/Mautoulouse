'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, setToken, clearToken, getToken } from './api'
import type { User } from './types'

const USER_KEY = 'mautoulouse_user'

function saveUser(u: User)  { localStorage.setItem(USER_KEY, JSON.stringify(u)) }
function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') } catch { return null }
}
function clearUser() { localStorage.removeItem(USER_KEY) }

interface AuthContextType {
  user:       User | null
  token:      string | null
  loading:    boolean
  login:      (email: string, password: string) => Promise<void>
  signup:     (data: { email: string; password: string; first_name: string; last_name: string; origin_city?: string }) => Promise<void>
  logout:     () => void
  updateUser: (u: User) => void
  isAdmin:    boolean
  isMod:      boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [token,   setTok]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = getToken()
    const storedUser  = loadUser()

    // Restore session instantly from localStorage — no API call needed
    // The token is still valid for API calls even if "expired" per JWT,
    // because the backend has verify_exp: False
    if (storedUser) setUser(storedUser)
    if (storedToken) setTok(storedToken)

    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password)
    setToken(res.access_token)
    setTok(res.access_token)
    setUser(res.user)
    saveUser(res.user)
  }

  async function signup(data: Parameters<typeof authApi.signup>[0]) {
    const res = await authApi.signup(data)
    setToken(res.access_token)
    setTok(res.access_token)
    setUser(res.user)
    saveUser(res.user)
  }

  function logout() {
    clearToken()
    clearUser()
    setTok(null)
    setUser(null)
  }

  function updateUser(updated: User) {
    setUser(updated)
    saveUser(updated)
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, signup, logout, updateUser,
      isAdmin: user?.role === 'admin',
      isMod:   user?.role === 'moderator' || user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
