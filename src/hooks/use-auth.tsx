import { createContext, useContext, useEffect, ReactNode } from 'react'
import useAuthStore, { type User } from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: User | null
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
  const { user, isInitialized, initialize, login, logout } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      login(authData.record as unknown as User)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    logout()
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading: !isInitialized }}>
      {children}
    </AuthContext.Provider>
  )
}
