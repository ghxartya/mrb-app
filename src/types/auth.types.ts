import type { User as FirebaseUser } from 'firebase/auth'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  firebaseUser: FirebaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}
