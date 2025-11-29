import { useState, useEffect } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { Class } from '@/shared/api/client'

interface Enrollment {
  id: string
  studentId: string
  classId: string
  class?: Class
}

export function useStudentData() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // TODO: Implement student enrollments API
        // const classes = await api.getClasses()
        // Filter classes where student is enrolled
        // This is a placeholder - actual implementation should use enrollments endpoint
        setEnrollments([])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  return {
    enrollments,
    loading,
    error,
  }
}

