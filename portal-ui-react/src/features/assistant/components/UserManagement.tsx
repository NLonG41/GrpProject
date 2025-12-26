import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { useAuthStore } from '@/shared/store/authStore'
import { User } from '@/shared/api/client'

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  ASSISTANT: 'bg-indigo-100 text-indigo-700',
  LECTURER: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-green-100 text-green-700',
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  ASSISTANT: 'Assistant',
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
}

export function UserManagement() {
  const { users, loading, error, createUser, updateRole, resetPassword } = useUsers()
  const { user: currentUser } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<{
    fullName: string
    email: string
    role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT'
    studentCode: string
    sendEmail: boolean
  }>({
    fullName: '',
    email: '',
    role: 'ASSISTANT',
    studentCode: '',
    sendEmail: true,
  })

  const isAdmin = currentUser?.role === 'ADMIN'
  
  // Debug: Log current user role and admin status
  console.log('[UserManagement] Current user:', {
    email: currentUser?.email,
    role: currentUser?.role,
    isAdmin: isAdmin
  })

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser(formData)
      setShowCreateModal(false)
      setFormData({
        fullName: '',
        email: '',
        role: 'ASSISTANT' as const,
        studentCode: '',
        sendEmail: true,
      })
      alert('Đã tạo user thành công!')
    } catch (err) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Failed to create user'))
    }
  }

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    if (userId === currentUser?.id) {
      alert('Bạn không thể thay đổi role của chính mình!')
      return
    }
    try {
      await updateRole(userId, newRole)
      alert('Đã cập nhật role thành công!')
    } catch (err) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Failed to update role'))
    }
  }

  const handleResetPassword = async (userId: string, userEmail: string) => {
    // Double check admin permission
    if (!currentUser || currentUser.role !== 'ADMIN') {
      alert('Chỉ có Admin mới được phép reset mật khẩu!')
      return
    }
    
    if (!confirm(`Bạn có chắc chắn muốn reset mật khẩu cho ${userEmail}?`)) {
      return
    }

    try {
      const result = await resetPassword(userId)
      alert(`Đã reset mật khẩu thành công!\nEmail: ${result.credentials.email}\nMật khẩu mới: ${result.credentials.password}`)
    } catch (err) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Failed to reset password'))
    }
  }

  if (error) {
    console.error('[UserManagement] Error:', error)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-center text-red-500">Lỗi: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-usth-navy text-white rounded-lg"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-center text-gray-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Quản lý Người dùng</h3>
            <p className="text-sm text-gray-500">Tạo user, set role, gửi credentials qua email.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-usth-navy text-white rounded-lg hover:bg-usth-sky transition"
          >
            + Tạo User
          </button>
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Mã SV</th>
                <th className="px-4 py-3 text-left">Major</th>
                <th className="px-4 py-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody id="users-table-body" className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Chưa có user nào
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentUser = user.id === currentUser?.id
                  const isStudent = user.role === 'STUDENT'
                  // Debug: Log student major data
                  if (isStudent) {
                    console.log('[UserManagement] Student:', user.email, 'Major:', user.major, 'Full user:', user)
                  }
                  
                  // Determine major display value
                  const majorDisplay = isStudent 
                    ? (user.major && user.major.trim() !== '' ? user.major : '-')
                    : '-'
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{user.email}</td>
                      <td className="px-4 py-3">{user.fullName}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value as User['role'])
                          }
                          disabled={isCurrentUser}
                          className={`text-sm border rounded px-2 py-1 ${roleColors[user.role] || 'bg-gray-100'}`}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="ASSISTANT">Assistant</option>
                          <option value="LECTURER">Lecturer</option>
                          <option value="STUDENT">Student</option>
                        </select>
                        {isCurrentUser && (
                          <span className="text-xs text-gray-500 ml-2">(Không thể thay đổi)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{user.studentCode || '-'}</td>
                      <td className="px-4 py-3">
                        {majorDisplay}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <button 
                            onClick={() => handleResetPassword(user.id, user.email)}
                            className="text-xs text-usth-navy hover:underline cursor-pointer"
                          >
                            Reset Password
                          </button>
                        ) : (
                          <span 
                            className="text-xs text-gray-400 cursor-not-allowed"
                            title="Chỉ Admin mới được phép reset mật khẩu"
                          >
                            Reset Password
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Tạo User Mới</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT' })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="ASSISTANT">Assistant</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  />
                  <span className="text-sm">Gửi credentials qua email</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-usth-navy text-white rounded hover:bg-usth-sky"
                >
                  Tạo User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

