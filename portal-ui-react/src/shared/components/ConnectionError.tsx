import { checkBackendConnection } from '@/shared/api/client'
import { useState, useEffect } from 'react'

// Get API URL from environment variable, default to port 4000 (matching backend default)
const CORE_API = import.meta.env.VITE_CORE_API || 'http://localhost:4000'

export function ConnectionError() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true)
      const connected = await checkBackendConnection()
      setIsConnected(connected)
      setIsChecking(false)
    }

    checkConnection()
    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [])

  if (isChecking) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-yellow-800">Đang kiểm tra kết nối...</p>
        </div>
      </div>
    )
  }

  if (isConnected === false) {
    return (
      <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">Không thể kết nối đến server</h4>
            <p className="text-sm text-red-700 mb-2">
              Vui lòng đảm bảo backend server đang chạy
            </p>
            <div className="text-xs text-red-600 space-y-1">
              <p>• Kiểm tra: Backend có đang chạy không?</p>
              <p>• URL: {CORE_API}</p>
              <p>• Chạy lệnh: <code className="bg-red-100 px-1 rounded">cd services/core && npm run dev</code></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}


