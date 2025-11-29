import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/shared/config/firebase'
import { useAuthStore } from '@/shared/store/authStore'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', user.id),
      where('read', '==', false)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notis = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[]
        setNotifications(notis)
      },
      (error) => {
        console.error('Firestore subscription error:', error)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { notifications }
}

