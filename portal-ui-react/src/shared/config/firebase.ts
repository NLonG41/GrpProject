import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCb-mwB6ip9iD1hCAt8jTbyDlhHlmPwsQc',
  authDomain: 'web-portal-us.firebaseapp.com',
  projectId: 'web-portal-us',
  storageBucket: 'web-portal-us.firebasestorage.app',
  messagingSenderId: '912991386094',
  appId: '1:912991386094:web:3c9c63eebaf052a7f1f6ff',
  measurementId: 'G-HDJRRJVW7Y',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Firestore for real-time subscriptions
export const db = getFirestore(app)

// Initialize Analytics (optional)
export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null

export default app

