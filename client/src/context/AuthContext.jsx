import { createContext, useContext, useEffect, useState } from 'react'
import { api, setToken } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nutri_token')
    if (!token) {
      setLoading(false)
      return
    }
    setToken(token)
    api
      .get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('nutri_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('nutri_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const data = await api.post('/auth/register', payload)
    localStorage.setItem('nutri_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const googleLogin = async (credential) => {
    const data = await api.post('/auth/google', { credential })
    localStorage.setItem('nutri_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('nutri_token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (u) => setUser(u)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)