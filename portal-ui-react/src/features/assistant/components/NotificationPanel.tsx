import { useState, useEffect } from 'react'
import { api, Notification } from '@/shared/api/client'
import { useAuthStore } from '@/shared/store/authStore'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await api.getNotifications({ 
        toUserId: user.id,
        userId: user.id 
      })
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông báo')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await api.updateNotification(id, { read: true })
      setNotifications((prev) =>
        prev.map((noti) => (noti.id === id ? { ...noti, read: true } : noti))
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id)
      setNotifications((prev) => prev.filter((noti) => noti.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications()
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md h-full max-h-[90vh] flex flex-col mt-16 mr-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Thông báo</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} thông báo chưa đọc</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-usth-navy border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((noti) => (
                <div
                  key={noti.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !noti.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{noti.title}</h4>
                        {!noti.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{noti.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(noti.createdAt).toLocaleString('vi-VN')}</span>
                        {noti.fromUser && (
                          <span>Từ: {noti.fromUser.fullName}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!noti.read && (
                        <button
                          onClick={() => markAsRead(noti.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(noti.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <button
              onClick={() => {
                notifications.forEach((noti) => {
                  if (!noti.read) markAsRead(noti.id)
                })
              }}
              className="text-sm text-usth-navy hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

