import { useAuthStore } from '@/shared/store/authStore'
import { useStudentData } from '../hooks/useStudentData'
import { useNotifications } from '../hooks/useNotifications'
import { useRoomStatus } from '../hooks/useRoomStatus'

export function StudentPortal() {
  const { user, logout } = useAuthStore()
  const { enrollments, loading: dataLoading } = useStudentData()
  const { notifications } = useNotifications()
  const { roomStatus } = useRoomStatus()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">USTH Student Portal</h1>
              <p className="text-sm text-gray-500">Xin chào, {user.fullName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Student Screen</h2>
          <p className="text-green-100">
            Chào mừng bạn đến với USTH Student Portal. Xem lịch học, điểm số và thông báo của bạn
            tại đây.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Khóa học của tôi</h2>
            {dataLoading ? (
              <p className="text-gray-500">Đang tải...</p>
            ) : enrollments.length === 0 ? (
              <p className="text-gray-500">Bạn chưa đăng ký khóa học nào</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="p-4 border rounded-lg">
                    <p className="font-medium">{enrollment.class?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">
                      {enrollment.class?.subject?.name || ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Thông báo</h2>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">Không có thông báo mới</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-gray-600">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Trạng thái phòng học (Real-time)</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(roomStatus).map(([roomId, status]) => (
              <div
                key={roomId}
                className={`p-4 border rounded-lg ${
                  (status as { currentStatus?: string })?.currentStatus === 'occupied'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <p className="font-medium">{roomId}</p>
                <p className="text-sm">
                  {(status as { currentStatus?: string })?.currentStatus === 'occupied'
                    ? 'Đang sử dụng'
                    : 'Trống'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

