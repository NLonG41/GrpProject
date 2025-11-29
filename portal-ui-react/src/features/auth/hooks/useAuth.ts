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
    setLoading(true)
    setError(null)
    try {
      const response = await authRepository.login(email, password)
      setUser(response.user)
      
      // Navigate based on role
      const role = response.user.role
      if (role === 'ADMIN' || role === 'ASSISTANT') {
        navigate('/assistant', { replace: true })
      } else if (role === 'STUDENT') {
        navigate('/student', { replace: true })
      } else if (role === 'LECTURER') {
        navigate('/lecturer', { replace: true })
      }
      
      return response
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: {
    fullName: string
    email: string
    password: string
    role?: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT'
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

