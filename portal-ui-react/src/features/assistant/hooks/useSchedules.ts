import { useState, useEffect } from 'react'
import { api, ClassSchedule } from '@/shared/api/client'
import { useAuthStore } from '@/shared/store/authStore'

interface UseSchedulesParams {
  classId?: string
  roomId?: string
  status?: 'ACTIVE' | 'CANCELLED'
  type?: 'MAIN' | 'MAKEUP' | 'EXAM'
}

export function useSchedules(params?: UseSchedulesParams) {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const loadSchedules = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getSchedules(params)
      setSchedules(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch học')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.classId, params?.roomId, params?.status, params?.type])

  const createSchedule = async (data: {
    classId: string
    roomId: string
    startTime: string
    endTime: string
    type?: 'MAIN' | 'MAKEUP' | 'EXAM'
    repeatType?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'WEEKLY_DAYS'
    repeatEndDate?: string
    numberOfSessions?: number
    repeatDaysOfWeek?: number[]
  }) => {
    try {
      if (!user?.id) throw new Error('Missing user ID')
      const newSchedule = await api.createSchedule(data, user.id)
      await loadSchedules()
      return newSchedule
    } catch (err: any) {
      throw new Error(err.message || 'Không thể tạo lịch học')
    }
  }

  const updateSchedule = async (
    id: string,
    data: Partial<{
      roomId: string
      startTime: string
      endTime: string
      type: 'MAIN' | 'MAKEUP' | 'EXAM'
      status: 'ACTIVE' | 'CANCELLED'
    }>
  ) => {
    try {
      if (!user?.id) throw new Error('Missing user ID')
      const updated = await api.updateSchedule(id, data, user.id)
      await loadSchedules()
      return updated
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật lịch học')
    }
  }

  const deleteSchedule = async (id: string) => {
    try {
      if (!user?.id) throw new Error('Missing user ID')
      await api.deleteSchedule(id, user.id)
      await loadSchedules()
    } catch (err: any) {
      throw new Error(err.message || 'Không thể xóa lịch học')
    }
  }

  return {
    schedules,
    loading,
    error,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}

