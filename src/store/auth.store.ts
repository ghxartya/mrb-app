import type { User as FirebaseUser } from 'firebase/auth'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import * as authService from '@/services/auth.service'

import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User
} from '@/types'

interface AuthActions {
  setUser: (user: User | null) => void
  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (credentials: RegisterCredentials) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  firebaseUser: null,
  isLoading: false,
  isAuthenticated: false,
  error: null
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialState,
        setUser: user =>
          set({
            user,
            isAuthenticated: !!user
          }),
        setFirebaseUser: firebaseUser => set({ firebaseUser }),
        setLoading: isLoading => set({ isLoading }),
        setError: error => set({ error }),
        login: async credentials => {
          set({ isLoading: true, error: null })
          const response = await authService.login(credentials)
          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false
            })
            return true
          }
          set({
            error: response.error ?? 'Login failed',
            isLoading: false
          })
          return false
        },
        register: async credentials => {
          set({ isLoading: true, error: null })
          const response = await authService.register(credentials)
          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false
            })
            return true
          }
          set({
            error: response.error ?? 'Registration failed',
            isLoading: false
          })
          return false
        },
        logout: async () => {
          set({ isLoading: true })
          await authService.signOut()
          set({
            ...initialState
          })
        },
        clearError: () => set({ error: null })
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'AuthStore' }
  )
)
