import { useState, useEffect } from 'react'
import { classesRepository } from '../repository/classesRepository'
import { Class } from '@/shared/api/client'

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadClasses = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await classesRepository.getAll()
      setClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  return {
    classes,
    loading,
    error,
    loadClasses,
  }
}

