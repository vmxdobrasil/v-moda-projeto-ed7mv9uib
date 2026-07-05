import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
  authError: string | null
  clearAuthError: () => void
  handleAuthFailure: (message?: string) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

function syncAuthStore(isValid: boolean, record: any) {
  useAuthStore.getState().syncState(isValid ? record : null, isValid)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      const isValid = pb.authStore.isValid && !!record
      setUser(isValid ? record : null)
      setIsAuthenticated(isValid)
      syncAuthStore(isValid, record)
    })

    const validateSession = async () => {
      if (!pb.authStore.isValid || !pb.authStore.record) {
        if (pb.authStore.record) pb.authStore.clear()
        setUser(null)
        setIsAuthenticated(false)
        syncAuthStore(false, null)
        setLoading(false)
        return
      }

      const record = pb.authStore.record
      const collectionName = record?.collectionName || 'users'

      try {
        await pb.collection(collectionName).authRefresh()
        const isValid = pb.authStore.isValid && !!pb.authStore.record
        if (isValid) {
          const refreshedRecord = pb.authStore.record
          setUser(refreshedRecord)
          setIsAuthenticated(true)
          syncAuthStore(true, refreshedRecord)
        } else {
          pb.authStore.clear()
          setUser(null)
          setIsAuthenticated(false)
          syncAuthStore(false, null)
        }
      } catch (err: any) {
        if (err?.status === 0) {
          const record = pb.authStore.record
          if (record) {
            setUser(record)
            setIsAuthenticated(true)
            syncAuthStore(true, record)
          }
        } else {
          pb.authStore.clear()
          setUser(null)
          setIsAuthenticated(false)
          syncAuthStore(false, null)
          if (err?.status === 401 || err?.status === 403) {
            setAuthError('Sua sessão expirou. Por favor, faça login novamente.')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    validateSession()

    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      setAuthError(null)
      await pb.collection('users').create({ email, password, passwordConfirm: password })
      await pb.collection('users').authWithPassword(email, password)
      const record = pb.authStore.record
      setUser(record)
      setIsAuthenticated(true)
      syncAuthStore(true, record)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthError(null)
      await pb.collection('users').authWithPassword(email, password)
      const record = pb.authStore.record
      setUser(record)
      setIsAuthenticated(true)
      syncAuthStore(true, record)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    setUser(null)
    setIsAuthenticated(false)
    syncAuthStore(false, null)
    setAuthError(null)
  }

  const clearAuthError = () => setAuthError(null)

  const handleAuthFailure = (message?: string) => {
    pb.authStore.clear()
    setUser(null)
    setIsAuthenticated(false)
    syncAuthStore(false, null)
    setAuthError(message || 'Sua sessão expirou. Por favor, faça login novamente.')
  }

  const refreshUser = async () => {
    if (!pb.authStore.isValid || !pb.authStore.record) return
    try {
      const updated = await pb.collection('users').getOne(pb.authStore.record.id)
      setUser(updated)
      syncAuthStore(true, updated)
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        pb.authStore.clear()
        setUser(null)
        setIsAuthenticated(false)
        syncAuthStore(false, null)
        setAuthError('Sua sessão expirou. Por favor, faça login novamente.')
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        loading,
        authError,
        clearAuthError,
        handleAuthFailure,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
