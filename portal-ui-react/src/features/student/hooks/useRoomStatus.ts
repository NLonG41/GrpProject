import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/shared/config/firebase'

export function useRoomStatus() {
  const [roomStatus, setRoomStatus] = useState<Record<string, unknown>>({})

  useEffect(() => {
    const roomsRef = collection(db, 'live_rooms')
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const status: Record<string, unknown> = {}
      snapshot.forEach((doc) => {
        status[doc.id] = doc.data()
      })
      setRoomStatus(status)
    })

    return () => unsubscribe()
  }, [])

  return { roomStatus }
}

