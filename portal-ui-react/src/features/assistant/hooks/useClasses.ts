import { useState, useEffect } from 'react'
import { classesRepository } from '../repository/classesRepository'
import { Class } from '@/shared/api/client'

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
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

  useEffect(() => {
    loadClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    classes,
    loading,
    error,
    loadClasses,
  }
}

