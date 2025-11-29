import { useState, useEffect } from 'react'
import { requestsRepository } from '../repository/requestsRepository'
import { Request } from '@/shared/api/client'

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await requestsRepository.getAll()
      setRequests(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  return {
    requests,
    loading,
    error,
    loadRequests,
  }
}

