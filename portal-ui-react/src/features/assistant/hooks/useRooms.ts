import { useState, useEffect } from 'react'
import { roomsRepository } from '../repository/roomsRepository'
import { Room } from '@/shared/api/client'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await roomsRepository.getAll()
      setRooms(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  return {
    rooms,
    loading,
    error,
    loadRooms,
  }
}

