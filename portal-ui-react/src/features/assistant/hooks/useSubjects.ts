import { useState, useEffect } from 'react'
import { subjectsRepository } from '../repository/subjectsRepository'
import { Subject, CreateSubjectPayload } from '@/shared/api/client'
import { useAuthStore } from '@/shared/store/authStore'

export function useSubjects() {
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSubjects = async () => {
    console.log('[useSubjects] Loading subjects...')
    setLoading(true)
    setError(null)
    try {
      const data = await subjectsRepository.getAll()
      console.log('[useSubjects] ✅ Subjects loaded:', { count: data.length })
      setSubjects(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load subjects'
      console.error('[useSubjects] ❌ Error loading subjects:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const createSubject = async (data: CreateSubjectPayload) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    console.log('[useSubjects] Creating subject...', data)
    setLoading(true)
    setError(null)
    try {
      const newSubject = await subjectsRepository.create(data, user.id)
      console.log('[useSubjects] ✅ Subject created:', newSubject)
      await loadSubjects() // Refresh list
      return newSubject
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create subject'
      console.error('[useSubjects] ❌ Error creating subject:', errorMsg)
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bulkCreateSubjects = async (subjectsData: CreateSubjectPayload[]) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    console.log('[useSubjects] Bulk creating subjects...', subjectsData.length)
    setLoading(true)
    setError(null)
    try {
      const result = await subjectsRepository.bulkCreate(subjectsData, user.id)
      console.log('[useSubjects] ✅ Bulk create completed:', result)
      await loadSubjects() // Refresh list
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to bulk create subjects'
      console.error('[useSubjects] ❌ Error bulk creating subjects:', errorMsg)
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    subjects,
    loading,
    error,
    loadSubjects,
    createSubject,
    bulkCreateSubjects,
  }
}

