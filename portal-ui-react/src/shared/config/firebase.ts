import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCcfx6DHYPkzMcZ2hDXwPk6yMPKXZEjvQk',
  authDomain: 'student-management-datab-bcfb1.firebaseapp.com',
  projectId: 'student-management-datab-bcfb1',
  storageBucket: 'student-management-datab-bcfb1.firebasestorage.app',
  messagingSenderId: '364781347954',
  appId: '1:364781347954:android:29d0d921927e32da460eeb',
  databaseURL: 'https://student-management-datab-bcfb1-default-rtdb.asia-southeast1.firebasedatabase.app',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize Firestore for real-time subscriptions
export const db = getFirestore(app)

// Initialize Analytics (optional)
export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null

export default app

