import { useState, useRef } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { User } from '@/shared/api/client'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB')
      return
    }

    setIsUploading(true)
    try {
      // Convert to base64 for preview (in production, upload to server)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
        setIsUploading(false)
        // TODO: Upload to server and update user profile
        alert('Ảnh đại diện đã được cập nhật (chức năng upload lên server đang được phát triển)')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      alert('Có lỗi xảy ra khi upload ảnh')
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Hồ sơ cá nhân</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                onClick={handleAvatarClick}
                className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden"
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg bg-usth-navy text-white hover:bg-usth-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Đang tải...' : 'Thay đổi ảnh đại diện'}
              </button>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG hoặc GIF (tối đa 5MB)</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-slate-900">{user.fullName}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-slate-900">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                  {user.role === 'ASSISTANT' ? 'Assistant' : user.role}
                </span>
              </div>
            </div>

            {user.studentCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã sinh viên</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-slate-900">{user.studentCode}</p>
                </div>
              </div>
            )}

            {user.cohort && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khóa học</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-slate-900">{user.cohort}</p>
                </div>
              </div>
            )}

            {user.major && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-slate-900">{user.major}</p>
                </div>
              </div>
            )}

            {user.department && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khoa</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-slate-900">{user.department}</p>
                </div>
              </div>
            )}

            {user.specialty && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên môn</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-slate-900">{user.specialty}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button
              className="px-6 py-2 rounded-lg bg-usth-navy text-white hover:bg-usth-navy/90 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}














