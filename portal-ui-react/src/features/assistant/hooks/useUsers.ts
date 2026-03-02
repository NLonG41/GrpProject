import { useState, useEffect } from 'react'
import { usersRepository } from '../repository/usersRepository'
import { User } from '@/shared/api/client'
import { useAuthStore } from '@/shared/store/authStore'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await usersRepository.getAll()
      // Debug: Log users data to check major field
      console.log('[useUsers] Loaded users:', data.length)
      const students = data.filter(u => u.role === 'STUDENT')
      console.log('[useUsers] Students found:', students.length)
      students.forEach(s => {
        console.log(`[useUsers] Student ${s.email}: major="${s.major}", role="${s.role}"`)
      })
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (data: {
    fullName: string
    email: string
    role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT'
    studentCode?: string
    cohort?: string
    major?: string
    department?: string
    specialty?: string
    sendEmail?: boolean
  }) => {
    if (!user) throw new Error('Not authenticated')
    setLoading(true)
    setError(null)
    try {
      const result = await usersRepository.create(data, user.id)
      await loadUsers() // Refresh list
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId: string, role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT') => {
    if (!user) throw new Error('Not authenticated')
    setLoading(true)
    setError(null)
    try {
      const result = await usersRepository.updateRole(userId, role, user.id)
      await loadUsers() // Refresh list
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (userId: string) => {
    if (!user) throw new Error('Not authenticated')
    setLoading(true)
    setError(null)
    try {
      const result = await usersRepository.resetPassword(userId, user.id)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Temporarily allow all roles to load users
    if (user) {
      console.log('[useUsers] Loading users for role:', user.role)
      loadUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateRole,
    resetPassword,
  }
}

