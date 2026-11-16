import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { storage } from '../services/storage'
import { ROLES } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getAuth())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // initialize storage defaults on mount
    storage.init()
    const stored = storage.getAuth()
    if (stored) {
      setUser(stored)
    }
  }, [])

  const login = async (loginId, password) => {
    setLoading(true)
    setError(null)
    try {
      const loggedUser = await api.login(loginId, password)
      setUser(loggedUser)
      return loggedUser
    } catch (err) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  const isCitizen = user?.role === ROLES.CITIZEN
  const isAdmin = user?.role === ROLES.ADMIN
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        isCitizen,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
