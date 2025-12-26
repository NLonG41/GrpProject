import { useState, useEffect } from 'react'
import { requestsRepository } from '../repository/requestsRepository'
import { Request } from '@/shared/api/client'
import { useAuthStore } from '@/shared/store/authStore'

export function useRequests() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRequests = async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    type?: 'REQ_LEAVE' | 'REQ_MAKEUP'
    senderId?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useRequests] Loading requests...', { userId: user?.id, params })
      const data = await requestsRepository.getAll({
        ...params,
        userId: user?.id
      })
      console.log('[useRequests] Loaded requests:', { count: data.length })
      setRequests(data)
    } catch (err) {
      console.error('[useRequests] Error loading requests:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load requests. Vui lòng kiểm tra backend có đang chạy không.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (id: string, adminNote?: string) => {
    try {
      const updated = await requestsRepository.approve(id, adminNote, user?.id)
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? updated : req))
      )
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request')
      throw err
    }
  }

  const declineRequest = async (id: string, adminNote?: string) => {
    try {
      const updated = await requestsRepository.decline(id, adminNote, user?.id)
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? updated : req))
      )
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline request')
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      loadRequests()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    requests,
    loading,
    error,
    loadRequests,
    approveRequest,
    declineRequest,
  }
}

