import React, { useState, useEffect, useMemo } from 'react'
import { useSchedules } from '../hooks/useSchedules'
import { useClasses } from '../hooks/useClasses'
import { useRooms } from '../hooks/useRooms'
import { useAuthStore } from '@/shared/store/authStore'
import { api, ClassSchedule } from '@/shared/api/client'

export function SchedulingBoard() {
  const { user } = useAuthStore()
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule, loadSchedules } = useSchedules()
  const { classes } = useClasses()
  const { rooms, loadRooms } = useRooms()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    classId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    type: 'MAIN' as 'MAIN' | 'MAKEUP' | 'EXAM',
    repeatType: 'NONE' as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'WEEKLY_DAYS',
    repeatEndDate: '',
    numberOfSessions: '',
    repeatDaysOfWeek: [] as number[], // 0=Sunday, 1=Monday, ..., 6=Saturday
    startTimeOfDay: '', // Format: "HH:mm" (ví dụ: "09:25")
    endTimeOfDay: '', // Format: "HH:mm" (ví dụ: "12:05")
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Group schedules by subject name
  const groupedSchedules = useMemo(() => {
    const groups: Record<string, typeof schedules> = {}
    schedules.forEach(schedule => {
      const subjectName = schedule.class?.subject?.name || 'Khác'
      if (!groups[subjectName]) {
        groups[subjectName] = []
      }
      groups[subjectName].push(schedule)
    })
    // Sort each group by start time
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    })
    return groups
  }, [schedules])

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subjectName)) {
        newSet.delete(subjectName)
      } else {
        newSet.add(subjectName)
      }
      return newSet
    })
  }

  // Real-time updates: poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadSchedules()
      loadRooms()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [loadSchedules, loadRooms])

  // Get locked rooms based on active schedules - chỉ khóa khi đang trong thời gian diễn ra class
  const lockedRooms = useMemo(() => {
    const now = new Date()
    const locked: Record<string, { until: Date; className: string; subjectName: string }> = {}
    
    schedules
      .filter(s => {
        if (s.status !== 'ACTIVE') return false
        const startTime = new Date(s.startTime)
        const endTime = new Date(s.endTime)
        // Chỉ khóa khi đang trong thời gian diễn ra class (startTime <= now <= endTime)
        return startTime <= now && now <= endTime
      })
      .forEach(schedule => {
        if (schedule.roomId && schedule.room) {
          const endTime = new Date(schedule.endTime)
          locked[schedule.roomId] = {
            until: endTime,
            className: schedule.class?.name || 'N/A',
            subjectName: schedule.class?.subject?.name || 'N/A',
          }
        }
      })
    
    return locked
  }, [schedules])

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Check room availability CHỈ khi KHÔNG có auto planning
    // Với auto planning, backend sẽ tự check overlap chính xác cho từng buổi học
    if (formData.repeatType === 'NONE' && formData.roomId && formData.startTime && formData.endTime) {
      try {
        // Convert local time (GMT+7) to ISO string
        const startTimeISO = new Date(formData.startTime).toISOString()
        const endTimeISO = new Date(formData.endTime).toISOString()
        
        const availability = await api.checkRoomAvailability(
          formData.roomId,
          startTimeISO,
          endTimeISO,
          undefined, // excludeScheduleId - không cần vì đang tạo mới
          formData.classId // Pass classId để exclude cùng class
        )
        
        if (!availability.isAvailable && availability.conflictingSchedule) {
          const conflictInfo = `Phòng đã được sử dụng bởi ${availability.conflictingSchedule.className} (${availability.conflictingSchedule.subjectName}) từ ${new Date(availability.conflictingSchedule.startTime).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })} đến ${new Date(availability.conflictingSchedule.endTime).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })}`
          setError(conflictInfo)
          setSubmitting(false)
          return
        }
      } catch (err) {
        console.error('Failed to check room availability:', err)
        setError('Không thể kiểm tra trạng thái phòng học. Vui lòng thử lại.')
        setSubmitting(false)
        return
      }
    }

    try {
      const scheduleData: any = {
        classId: formData.classId,
        roomId: formData.roomId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        type: formData.type,
        repeatType: formData.repeatType,
      }

      if (formData.repeatType !== 'NONE') {
        if (formData.repeatType === 'WEEKLY_DAYS') {
          if (formData.repeatDaysOfWeek.length === 0) {
            setError('Vui lòng chọn ít nhất 1 ngày trong tuần')
            setSubmitting(false)
            return
          }
          scheduleData.repeatDaysOfWeek = formData.repeatDaysOfWeek
        }
        // Thêm time slot trong ngày - bắt buộc khi có auto planning
        if (!formData.startTimeOfDay || !formData.endTimeOfDay) {
          setError('Vui lòng nhập giờ bắt đầu và kết thúc trong ngày')
          setSubmitting(false)
          return
        }
        scheduleData.startTimeOfDay = formData.startTimeOfDay
        scheduleData.endTimeOfDay = formData.endTimeOfDay
        if (formData.repeatEndDate) {
          scheduleData.repeatEndDate = new Date(formData.repeatEndDate).toISOString()
        }
        if (formData.numberOfSessions) {
          scheduleData.numberOfSessions = parseInt(formData.numberOfSessions)
        }
      }

      await createSchedule(scheduleData)
      setShowCreateModal(false)
      setFormData({
        classId: '',
        roomId: '',
        startTime: '',
        endTime: '',
        type: 'MAIN',
        repeatType: 'NONE',
        repeatEndDate: '',
        numberOfSessions: '',
        repeatDaysOfWeek: [],
        startTimeOfDay: '',
        endTimeOfDay: '',
      })
    } catch (err: any) {
      setError(err.message || 'Không thể tạo lịch học')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSchedule = (schedule: ClassSchedule) => {
    // Convert ISO dates to local datetime-local format (GMT+7)
    const startTimeLocal = new Date(schedule.startTime)
    const endTimeLocal = new Date(schedule.endTime)
    
    // Adjust for GMT+7 timezone
    const startTimeStr = new Date(startTimeLocal.getTime() - (7 * 60 * 60 * 1000))
      .toISOString()
      .slice(0, 16)
    const endTimeStr = new Date(endTimeLocal.getTime() - (7 * 60 * 60 * 1000))
      .toISOString()
      .slice(0, 16)
    
    setEditingSchedule(schedule)
    setFormData({
      classId: schedule.classId,
      roomId: schedule.roomId,
      startTime: startTimeStr,
      endTime: endTimeStr,
      type: schedule.type,
      repeatType: 'NONE',
      repeatEndDate: '',
      numberOfSessions: '',
      repeatDaysOfWeek: [],
      startTimeOfDay: '',
      endTimeOfDay: '',
    })
    setError(null)
    setShowEditModal(true)
  }

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSchedule) return
    
    setError(null)
    setSubmitting(true)

    try {
      const updateData: any = {}
      
      if (formData.roomId !== editingSchedule.roomId) {
        updateData.roomId = formData.roomId
      }
      if (formData.startTime) {
        updateData.startTime = new Date(formData.startTime).toISOString()
      }
      if (formData.endTime) {
        updateData.endTime = new Date(formData.endTime).toISOString()
      }
      if (formData.type !== editingSchedule.type) {
        updateData.type = formData.type
      }

      await updateSchedule(editingSchedule.id, updateData)
      setShowEditModal(false)
      setEditingSchedule(null)
      setFormData({
        classId: '',
        roomId: '',
        startTime: '',
        endTime: '',
        type: 'MAIN',
        repeatType: 'NONE',
        repeatEndDate: '',
        numberOfSessions: '',
        repeatDaysOfWeek: [],
        startTimeOfDay: '',
        endTimeOfDay: '',
      })
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật lịch học')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lịch học này?')) return
    
    try {
      await deleteSchedule(id)
    } catch (err: any) {
      alert(err.message || 'Không thể xóa lịch học')
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Sử dụng 24h format
    })
  }

  const handleExportCalendar = async () => {
    if (!user?.id) {
      alert('Vui lòng đăng nhập để export calendar')
      return
    }

    try {
      const CORE_API = import.meta.env.VITE_CORE_API || 'http://localhost:4000'
      const response = await fetch(`${CORE_API}/api/schedules/export-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ scheduleIds: schedules.map(s => s.id) }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Không thể export calendar')
      }

      const text = await response.text()
      const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lich-hoc-${new Date().toISOString().split('T')[0]}.ics`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      alert(err.message || 'Không thể export calendar')
    }
  }


  const handleImportExcel = async (_file: File) => {
    // This will be implemented with Excel parsing
    alert('Tính năng import Excel đang được phát triển')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Xếp lịch học</h2>
            <p className="text-gray-500">Quản lý và xếp lịch học cho các lớp</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Excel
            </button>
            <button
              onClick={handleExportCalendar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Calendar
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo lịch học
            </button>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lịch học</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có lịch học nào. Hãy tạo lịch học mới.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Lớp học</th>
                  <th className="px-4 py-3 text-left">Môn học</th>
                  <th className="px-4 py-3 text-left">Phòng</th>
                  <th className="px-4 py-3 text-left">Thời gian bắt đầu</th>
                  <th className="px-4 py-3 text-left">Thời gian kết thúc</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(groupedSchedules).map(([subjectName, subjectSchedules]) => {
                  const isExpanded = expandedSubjects.has(subjectName)
                  const scheduleCount = subjectSchedules.length
                  
                  return (
                    <React.Fragment key={subjectName}>
                      {/* Header row for subject group */}
                      <tr 
                        className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => toggleSubject(subjectName)}
                      >
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <svg 
                                className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="font-semibold text-gray-900">
                                {subjectName}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                {scheduleCount} {scheduleCount === 1 ? 'lịch' : 'lịch'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {/* Schedule rows - only show when expanded */}
                      {isExpanded && subjectSchedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {schedule.class?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {schedule.class?.subject?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {schedule.room?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDateTime(schedule.startTime)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDateTime(schedule.endTime)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              schedule.type === 'MAIN' ? 'bg-blue-50 text-blue-600' :
                              schedule.type === 'MAKEUP' ? 'bg-yellow-50 text-yellow-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {schedule.type === 'MAIN' ? 'Chính' :
                               schedule.type === 'MAKEUP' ? 'Bù' : 'Thi'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                schedule.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                              }`}>
                                {schedule.status === 'ACTIVE' ? 'Hoạt động' : 'Đã hủy'}
                              </span>
                              {schedule.status === 'ACTIVE' && (() => {
                                const now = new Date()
                                const startTime = new Date(schedule.startTime)
                                const endTime = new Date(schedule.endTime)
                                // Chỉ hiển thị "Đã khóa phòng" khi đang trong thời gian diễn ra class
                                const isCurrentlyLocked = startTime <= now && now <= endTime
                                return isCurrentlyLocked ? (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">
                                    🔒 Đã khóa phòng
                                  </span>
                                ) : null
                              })()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditSchedule(schedule)
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Sửa lịch học"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSchedule(schedule.id)
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Xóa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <>
          <style>{`
            /* Force 24h format for time inputs */
            input[type="time"]::-webkit-calendar-picker-indicator {
              filter: invert(0);
            }
            input[type="time"] {
              color-scheme: light;
            }
            /* Hide AM/PM if browser shows it - comprehensive rules for all browsers */
            input[type="time"]::-webkit-datetime-edit-ampm-field {
              display: none !important;
              visibility: hidden !important;
              width: 0 !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              opacity: 0 !important;
            }
            /* Hide AM/PM in Chrome/Safari */
            input[type="time"]::-webkit-datetime-edit-hour-field[aria-label*="AM"],
            input[type="time"]::-webkit-datetime-edit-hour-field[aria-label*="PM"] {
              display: none !important;
            }
            /* For Firefox */
            input[type="time"] {
              -moz-appearance: textfield;
            }
            input[type="time"]::-moz-datetime-edit-ampm-field {
              display: none !important;
              visibility: hidden !important;
            }
            /* For Edge and other browsers */
            input[type="time"]::-ms-clear {
              display: none;
            }
            input[type="time"]::-ms-expand {
              display: none;
            }
            /* Ensure 24-hour format is used */
            input[type="time"] {
              text-align: center;
            }
          `}</style>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Tạo lịch học mới</h3>
            </div>
            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp học *
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn lớp học</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.subject?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng học *
                </label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn phòng học</option>
                  {rooms.filter(r => !r.isMaintenance).map((room) => {
                    const isLocked = lockedRooms[room.id] !== undefined
                    const lockInfo = lockedRooms[room.id]
                    
                    return (
                      <option 
                        key={room.id} 
                        value={room.id}
                      >
                        {room.name} - {room.location} ({room.capacity} chỗ)
                        {isLocked && ` [Đã khóa đến ${lockInfo.until.toLocaleString('vi-VN', { hour12: false })}]`}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian bắt đầu * (GMT+7)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Múi giờ: GMT+7 (Việt Nam)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian kết thúc * (GMT+7)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Múi giờ: GMT+7 (Việt Nam)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại lịch học *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MAIN">Lịch chính</option>
                  <option value="MAKEUP">Lịch bù</option>
                  <option value="EXAM">Lịch thi</option>
                </select>
              </div>

              {/* Auto Planning Section */}
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">📅 Tự động lặp lại (Auto Planning)</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lặp lại
                  </label>
                  <select
                    value={formData.repeatType}
                    onChange={(e) => {
                      const newRepeatType = e.target.value as any
                      setFormData({ 
                        ...formData, 
                        repeatType: newRepeatType,
                        // Reset days if switching away from WEEKLY_DAYS
                        repeatDaysOfWeek: newRepeatType !== 'WEEKLY_DAYS' ? [] : formData.repeatDaysOfWeek
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="NONE">Không lặp lại (1 buổi)</option>
                    <option value="DAILY">Hàng ngày</option>
                    <option value="WEEKLY">Hàng tuần (cùng ngày mỗi tuần)</option>
                    <option value="WEEKLY_DAYS">Chọn ngày trong tuần (Monday, Tuesday, etc.)</option>
                    <option value="MONTHLY">Hàng tháng</option>
                  </select>
                </div>

                {/* Days of week selector for WEEKLY_DAYS */}
                {formData.repeatType === 'WEEKLY_DAYS' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn ngày trong tuần *
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { value: 0, label: 'CN', name: 'Chủ nhật' },
                        { value: 1, label: 'T2', name: 'Thứ 2' },
                        { value: 2, label: 'T3', name: 'Thứ 3' },
                        { value: 3, label: 'T4', name: 'Thứ 4' },
                        { value: 4, label: 'T5', name: 'Thứ 5' },
                        { value: 5, label: 'T6', name: 'Thứ 6' },
                        { value: 6, label: 'T7', name: 'Thứ 7' },
                      ].map((day) => {
                        const isSelected = formData.repeatDaysOfWeek.includes(day.value)
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              const newDays = isSelected
                                ? formData.repeatDaysOfWeek.filter(d => d !== day.value)
                                : [...formData.repeatDaysOfWeek, day.value].sort()
                              setFormData({ ...formData, repeatDaysOfWeek: newDays })
                            }}
                            className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                            title={day.name}
                          >
                            {day.label}
                          </button>
                        )
                      })}
                    </div>
                    {formData.repeatDaysOfWeek.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">Vui lòng chọn ít nhất 1 ngày</p>
                    )}
                    {formData.repeatDaysOfWeek.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Đã chọn: {formData.repeatDaysOfWeek.map(d => {
                          const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
                          return days[d]
                        }).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {formData.repeatType !== 'NONE' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số buổi học
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.numberOfSessions}
                          onChange={(e) => setFormData({ ...formData, numberOfSessions: e.target.value })}
                          placeholder="VD: 15 buổi"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Để trống nếu dùng số buổi từ môn học
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kết thúc lặp lại
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.repeatEndDate}
                          onChange={(e) => setFormData({ ...formData, repeatEndDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Để trống nếu dùng số buổi học
                        </p>
                      </div>
                    </div>
                    
                    {/* Time slot trong ngày - để tránh lỗi lock class */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ bắt đầu trong ngày * (GMT+7) - 24h format
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.startTimeOfDay}
                          onChange={(e) => setFormData({ ...formData, startTimeOfDay: e.target.value })}
                          step="60"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{ 
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '0.05em'
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          VD: 09:25 (định dạng 24h)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ kết thúc trong ngày * (GMT+7) - 24h format
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.endTimeOfDay}
                          onChange={(e) => setFormData({ ...formData, endTimeOfDay: e.target.value })}
                          step="60"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{ 
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '0.05em'
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          VD: 12:05 (định dạng 24h)
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        💡 <strong>Lưu ý:</strong> Hệ thống sẽ tạo nhiều lịch học tự động dựa trên:
                        <br />• Lặp lại: {formData.repeatType === 'WEEKLY' ? 'Hàng tuần (Every Sunday, Monday, etc.)' : formData.repeatType === 'DAILY' ? 'Hàng ngày' : 'Hàng tháng'}
                        {formData.numberOfSessions && <><br />• Số buổi: {formData.numberOfSessions} buổi</>}
                        {formData.repeatEndDate && <><br />• Kết thúc: {new Date(formData.repeatEndDate).toLocaleDateString('vi-VN')}</>}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setError(null)
                    setFormData({
                      classId: '',
                      roomId: '',
                      startTime: '',
                      endTime: '',
                      type: 'MAIN',
                      repeatType: 'NONE',
                      repeatEndDate: '',
                      numberOfSessions: '',
                      repeatDaysOfWeek: [],
                      startTimeOfDay: '',
                      endTimeOfDay: '',
                    })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo lịch học'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Sửa lịch học</h3>
            </div>
            <form onSubmit={handleUpdateSchedule} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp học
                </label>
                <input
                  type="text"
                  value={editingSchedule.class?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng học *
                </label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn phòng học</option>
                  {rooms.filter(r => !r.isMaintenance).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.location} ({room.capacity} chỗ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian bắt đầu * (GMT+7)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian kết thúc * (GMT+7)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại lịch học *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MAIN">Lịch chính</option>
                  <option value="MAKEUP">Lịch bù</option>
                  <option value="EXAM">Lịch thi</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSchedule(null)
                    setError(null)
                    setFormData({
                      classId: '',
                      roomId: '',
                      startTime: '',
                      endTime: '',
                      type: 'MAIN',
                      repeatType: 'NONE',
                      repeatEndDate: '',
                      numberOfSessions: '',
                      repeatDaysOfWeek: [],
                      startTimeOfDay: '',
                      endTimeOfDay: '',
                    })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật lịch học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Import từ Excel</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng chọn file Excel (.xlsx) để import lịch học.
                File phải có các cột: Lớp học, Phòng, Thời gian bắt đầu, Thời gian kết thúc, Loại.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImportExcel(file)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
