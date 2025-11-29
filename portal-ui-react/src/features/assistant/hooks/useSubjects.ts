import { useState, useEffect } from 'react'
import { subjectsRepository } from '../repository/subjectsRepository'
import { Subject } from '@/shared/api/client'

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await subjectsRepository.getAll()
      setSubjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  return {
    subjects,
    loading,
    error,
    loadSubjects,
  }
}

