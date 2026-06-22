// src/context/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '@/lib/api'

export interface User {
  id: number
  email: string
  role: 'admin' | 'agent' | 'lecteur'
  full_name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const TOKEN_KEY = process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'siga_token'

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]))
        setUser({
          id: payload.user_id,
          email: payload.sub,
          role: payload.role || 'lecteur',
          full_name: payload.full_name || 'Utilisateur',
        })
      } catch (e) {
        console.error('Token invalide')
        localStorage.removeItem(TOKEN_KEY)
      }
    }
    setLoading(false)
  }, [TOKEN_KEY])

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    const { access_token, user: userData } = response.data
    
    localStorage.setItem(TOKEN_KEY, access_token)
    setToken(access_token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être dans AuthProvider')
  return context
}