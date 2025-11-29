import { useAuthStore } from '@/shared/store/authStore'
import { useLecturerData } from '../hooks/useLecturerData'

export function LecturerPortal() {
  const { user, logout } = useAuthStore()
  const { classes, requests, loading } = useLecturerData()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">USTH Lecturer Portal</h1>
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Lecturer Screen</h2>
          <p className="text-blue-100">
            Chào mừng bạn đến với USTH Lecturer Portal. Quản lý lớp học và yêu cầu của bạn tại đây.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Lớp học của tôi</h2>
          {loading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : classes.length === 0 ? (
            <p className="text-gray-500">Bạn chưa có lớp học nào</p>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-sm text-gray-500">{cls.subject?.name || ''}</p>
                  <p className="text-sm text-gray-500">
                    Sinh viên: {cls.currentEnrollment}/{cls.maxCapacity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Yêu cầu của tôi</h2>
          {loading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500">Bạn chưa có yêu cầu nào</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg">
                  <p className="font-medium">
                    {req.type === 'REQ_LEAVE' ? 'Xin nghỉ' : 'Dạy bù'}
                  </p>
                  <p className="text-sm text-gray-500">Trạng thái: {req.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

