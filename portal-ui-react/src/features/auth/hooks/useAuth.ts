import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { authRepository } from '../repository/authRepository'
import { ApiError } from '@/shared/api/client'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    console.log('[useAuth] Login called', { email })
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useAuth] Calling authRepository.login...')
      const response = await authRepository.login(email, password)
      console.log('[useAuth] ✅ Login response received', {
        userId: response.user.id,
        email: response.user.email,
        role: response.user.role,
        fullName: response.user.fullName
      })

      // Temporarily allow all roles - no role check
      console.log('[useAuth] User role:', { role: response.user.role })
      console.log('[useAuth] ⚠️ Role check disabled - allowing all roles temporarily')
      
      console.log('[useAuth] Setting user and navigating...')
      setUser(response.user)
      
      // Navigate to assistant for all roles
      console.log('[useAuth] Navigating to /assistant for all roles')
      navigate('/assistant', { replace: true })
      
      console.log('[useAuth] ✅ Login completed successfully')
      return response
    } catch (err: any) {
      console.error('[useAuth] ❌ Login error:', {
        error: err,
        code: err.code,
        message: err.message,
        name: err.name,
        isApiError: err instanceof ApiError,
        status: err.status,
        data: err.data
      })
      
      const message =
        err instanceof ApiError
          ? err.message
          : err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.'
      
      console.error('[useAuth] Setting error message:', message)
      setError(message)
      throw err
    } finally {
      setLoading(false)
      console.log('[useAuth] Login process finished, loading set to false')
    }
  }

  const register = async (data: {
    fullName: string
    email: string
    password: string
    role?: 'ASSISTANT'
    studentCode?: string
    cohort?: string
    major?: string
    department?: string
    specialty?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authRepository.register(data)
      setUser(response.user)
      return response
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Đăng ký thất bại. Vui lòng thử lại.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      return await authRepository.forgotPassword(email)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Không thể khôi phục mật khẩu'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    register,
    forgotPassword,
    loading,
    error,
  }
}

