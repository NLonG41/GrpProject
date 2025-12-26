import { useState, useEffect } from 'react'
import { enrollmentsRepository } from '../repository/enrollmentsRepository'
import { Enrollment } from '@/shared/api/client'
import { useAuthStore } from '@/shared/store/authStore'

export function useEnrollments(classId?: string) {
  const { user } = useAuthStore()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEnrollments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await enrollmentsRepository.getAll(
        classId ? { classId } : undefined
      )
      setEnrollments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  const addEnrollment = async (studentId: string, classId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    try {
      const newEnrollment = await enrollmentsRepository.create({
        studentId,
        classId,
      }, user.id)
      setEnrollments((prev) => [...prev, newEnrollment])
      return newEnrollment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add enrollment')
      throw err
    }
  }

  const removeEnrollment = async (enrollmentId: string) => {
    try {
      await enrollmentsRepository.delete(enrollmentId)
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove enrollment')
      throw err
    }
  }

  useEffect(() => {
    loadEnrollments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  return {
    enrollments,
    loading,
    error,
    loadEnrollments,
    addEnrollment,
    removeEnrollment,
  }
}
