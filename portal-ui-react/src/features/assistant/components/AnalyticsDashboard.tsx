import { useEffect, useState } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { api } from '@/shared/api/client'

interface AnalyticsData {
  users: {
    total: number
    byRole: {
      ADMIN: number
      ASSISTANT: number
      LECTURER: number
      STUDENT: number
    }
    newThisMonth: number
  }
  subjects: {
    total: number
    active: number
  }
  classes: {
    total: number
    active: number
    full: number
    available: number
  }
  enrollments: {
    total: number
    averagePerClass: number
    mostEnrolledClass: {
      id: string
      name: string
      subjectName: string
      enrollmentCount: number
    } | null
    bySubject: Array<{
      subjectId: string
      subjectName: string
      enrollmentCount: number
    }>
  }
  requests: {
    total: number
    pending: number
    approved: number
    rejected: number
    approvalRate: number
    byType: {
      REQ_LEAVE: number
      REQ_MAKEUP: number
    }
  }
  schedules: {
    totalThisWeek: number
    totalThisMonth: number
    mostUsedRoom: {
      id: string
      name: string
      location: string
      usageCount: number
    } | null
  }
}

export function AnalyticsDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) {
        setError('Vui lòng đăng nhập để xem analytics')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const analytics = await api.getAnalyticsDashboard(user.id)
        setData(analytics as AnalyticsData)
      } catch (err: any) {
        const errorMessage = err.message || err.data?.error || 'Không thể tải dữ liệu analytics'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user?.id])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-100 p-8">
        <div className="flex items-center gap-3 text-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ReactNode
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-500">Tổng quan thống kê hệ thống</p>
      </div>

      {/* Users Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng người dùng"
            value={data.users.total}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Sinh viên"
            value={data.users.byRole.STUDENT}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="Giảng viên"
            value={data.users.byRole.LECTURER}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            color="purple"
          />
          <StatCard
            title="Mới trong tháng"
            value={data.users.newThisMonth}
            subtitle="Người dùng mới"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="orange"
          />
        </div>
      </div>

      {/* Subjects & Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Môn học</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Tổng môn học"
              value={data.subjects.total}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              color="indigo"
            />
            <StatCard
              title="Đang hoạt động"
              value={data.subjects.active}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lớp học</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Tổng lớp học"
              value={data.classes.total}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              color="blue"
            />
            <StatCard
              title="Đang hoạt động"
              value={data.classes.active}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatCard
              title="Đã đầy"
              value={data.classes.full}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              color="red"
            />
            <StatCard
              title="Còn chỗ"
              value={data.classes.available}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Enrollments & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đăng ký học</h3>
          <div className="space-y-4">
            <StatCard
              title="Tổng đăng ký"
              value={data.enrollments.total}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
              color="blue"
            />
            <StatCard
              title="Trung bình mỗi lớp"
              value={data.enrollments.averagePerClass.toFixed(1)}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              color="purple"
            />
            {data.enrollments.mostEnrolledClass && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-2">Lớp có nhiều đăng ký nhất</p>
                <p className="font-semibold text-gray-900">{data.enrollments.mostEnrolledClass.name}</p>
                <p className="text-sm text-gray-600">{data.enrollments.mostEnrolledClass.subjectName}</p>
                <p className="text-xs text-gray-400 mt-1">{data.enrollments.mostEnrolledClass.enrollmentCount} đăng ký</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu</h3>
          <div className="space-y-4">
            <StatCard
              title="Tổng yêu cầu"
              value={data.requests.total}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              color="blue"
            />
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
                <p className="text-xs text-yellow-600 mb-1">Chờ xử lý</p>
                <p className="text-xl font-bold text-yellow-700">{data.requests.pending}</p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-3">
                <p className="text-xs text-green-600 mb-1">Đã duyệt</p>
                <p className="text-xl font-bold text-green-700">{data.requests.approved}</p>
              </div>
              <div className="bg-red-50 rounded-lg border border-red-200 p-3">
                <p className="text-xs text-red-600 mb-1">Đã từ chối</p>
                <p className="text-xl font-bold text-red-700">{data.requests.rejected}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Tỷ lệ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{data.requests.approvalRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedules */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch học</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Tuần này"
            value={data.schedules.totalThisWeek}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Tháng này"
            value={data.schedules.totalThisMonth}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="purple"
          />
          {data.schedules.mostUsedRoom && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-2">Phòng được dùng nhiều nhất</p>
              <p className="font-semibold text-gray-900">{data.schedules.mostUsedRoom.name}</p>
              <p className="text-sm text-gray-600">{data.schedules.mostUsedRoom.location}</p>
              <p className="text-xs text-gray-400 mt-1">{data.schedules.mostUsedRoom.usageCount} lần sử dụng</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Subjects by Enrollment */}
      {data.enrollments.bySubject.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top môn học theo đăng ký</h3>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-3">
              {data.enrollments.bySubject.slice(0, 5).map((subject, index) => (
                <div key={subject.subjectId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{subject.subjectName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{subject.enrollmentCount}</p>
                    <p className="text-xs text-gray-500">đăng ký</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

