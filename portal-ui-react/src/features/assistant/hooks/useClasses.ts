import { useState, useEffect } from 'react'
import { classesRepository } from '../repository/classesRepository'
import { Class, CreateClassPayload } from '@/shared/api/client'
import { useAuthStore } from '@/shared/store/authStore'

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadClasses = async () => {
    console.log('[useClasses] Loading classes...')
    setLoading(true)
    setError(null)
    try {
      const data = await classesRepository.getAll()
      console.log('[useClasses] ✅ Classes loaded:', { count: data.length })
      setClasses(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load classes'
      console.error('[useClasses] ❌ Error loading classes:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const createClass = async (data: CreateClassPayload) => {
    if (!user?.id) throw new Error('Not authenticated')
    setLoading(true)
    setError(null)
    try {
      const newClass = await classesRepository.create(data, user.id)
      await loadClasses()
      return newClass
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create class'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    classes,
    loading,
    error,
    loadClasses,
    createClass,
  }
}

