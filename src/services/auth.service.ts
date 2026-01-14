import {
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

import { auth, db } from '@/lib/firebase'

import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User
} from '@/types'

export function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
    updatedAt: new Date(firebaseUser.metadata.lastSignInTime ?? Date.now())
  }
}

export async function register(
  credentials: RegisterCredentials
): Promise<AuthResponse> {
  try {
    const { email, password, displayName } = credentials
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    await updateProfile(userCredential.user, { displayName })
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      photoURL: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    await sendEmailVerification(userCredential.user)
    return {
      success: true,
      user: mapFirebaseUser(userCredential.user)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    }
  }
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const { email, password } = credentials
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    return {
      success: true,
      user: mapFirebaseUser(userCredential.user)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    }
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        emailVerified: data.emailVerified ?? false,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date()
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}
