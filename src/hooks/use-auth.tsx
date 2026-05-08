import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.token) {
        try {
          const collection = pb.authStore.record?.collectionName || 'users'
          if (
            collection !== '_superusers' &&
            pb.authStore.record?.email !== 'valterpmendonca@gmail.com'
          ) {
            await pb.collection(collection).authRefresh()
          }
          if (mounted) setUser(pb.authStore.record)
        } catch (err) {
          pb.authStore.clear()
          if (mounted) setUser(null)
        }
      } else {
        if (mounted) setUser(null)
      }
      if (mounted) setLoading(false)
    }

    initAuth()

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (mounted) {
        setUser(pb.authStore.isValid ? record : null)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
