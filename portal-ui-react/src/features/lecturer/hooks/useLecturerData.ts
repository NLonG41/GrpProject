import { useState, useEffect } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { api, Class, Request } from '@/shared/api/client'

export function useLecturerData() {
  const [classes, setClasses] = useState<Class[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user || user.role !== 'LECTURER') return

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [classesData, requestsData] = await Promise.all([
          api.getClasses(),
          api.getRequests(),
        ])
        setClasses(classesData.filter((c) => c.lecturerId === user.id))
        setRequests(requestsData.filter((r) => r.senderId === user.id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lecturer data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  return {
    classes,
    requests,
    loading,
    error,
  }
}

