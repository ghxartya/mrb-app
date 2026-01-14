'use client'

import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'

import { auth } from '@/lib/firebase'

import { mapFirebaseUser } from '@/services/auth.service'

import { useAuthStore } from '@/store'

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    setUser,
    setFirebaseUser,
    setLoading,
    login,
    register,
    logout,
    clearError
  } = useAuthStore()

  useEffect(() => {
    setLoading(true)

    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser)
        setUser(mapFirebaseUser(firebaseUser))
      } else {
        setFirebaseUser(null)
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setFirebaseUser, setLoading])

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError
  }
}
