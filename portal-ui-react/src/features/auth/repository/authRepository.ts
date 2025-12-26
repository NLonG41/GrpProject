import { api, LoginResponse } from '@/shared/api/client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/shared/config/firebase'

export const authRepository = {
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('[authRepository] Starting login process...', { email })
    
    try {
      // Use Firebase Auth
      console.log('[authRepository] Step 1: Signing in with Firebase Auth...')
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('[authRepository] ✅ Step 1: Firebase Auth successful', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      })
      
      console.log('[authRepository] Step 2: Getting ID token...')
      const idToken = await userCredential.user.getIdToken()
      console.log('[authRepository] ✅ Step 2: ID token obtained', {
        tokenLength: idToken.length,
        tokenPreview: idToken.substring(0, 50) + '...'
      })
      
      // Send token to backend to get user data
      console.log('[authRepository] Step 3: Sending token to backend...')
      const response = await api.firebaseLogin(idToken)
      console.log('[authRepository] ✅ Step 3: Backend login successful', {
        userId: response.user.id,
        email: response.user.email,
        role: response.user.role,
        fullName: response.user.fullName
      })
      
      return response
    } catch (error: any) {
      console.error('[authRepository] ❌ Login failed:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      throw error
    }
  },

  async register(data: {
    fullName: string
    email: string
    password: string
    role?: 'ASSISTANT'
    studentCode?: string
    cohort?: string
    major?: string
    department?: string
    specialty?: string
  }): Promise<LoginResponse> {
    return api.register(data)
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.forgotPassword(email)
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return api.changePassword(userId, currentPassword, newPassword)
  },
}

