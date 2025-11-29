import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
const logo = '/assets/usth-logo.png'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'forgot-password'>('login')
  const { login, forgotPassword, loading, error } = useAuth()
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    try {
      await login(email, password)
    } catch (err) {
      setStatus({ type: 'error', message: error || 'Đăng nhập thất bại' })
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    try {
      await forgotPassword(email)
      setStatus({
        type: 'success',
        message: 'Nếu email tồn tại, mật khẩu mới đã được gửi đến email của bạn.',
      })
      setTimeout(() => {
        setAuthMode('login')
        setStatus(null)
      }, 3000)
    } catch (err) {
      setStatus({ type: 'error', message: error || 'Không thể khôi phục mật khẩu' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#081836] via-[#0a2a55] to-[#d7263d]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-subtle px-10 py-12 text-center text-slate-900">
        <div className="flex flex-col items-center gap-5">
          <div className="w-64 h-28 flex items-center justify-center">
            <img src={logo} alt="USTH Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">USTH Academic Portal</h1>
          <p className="text-sm text-slate-500">
            {authMode === 'forgot-password'
              ? 'Khôi phục mật khẩu của bạn.'
              : 'Đăng nhập để truy cập hệ thống quản lý lịch học và dữ liệu đào tạo.'}
          </p>
        </div>

        {status && (
          <div
            className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
              status.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : status.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {status.message}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="mt-8 space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email USTH
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:border-usth-navy focus:ring-usth-navy"
                placeholder="assistant@usth.edu.vn"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:border-usth-navy focus:ring-usth-navy"
                placeholder="********"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#d7263d] text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-[#b81f32] transition disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Login Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="mt-8 space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email USTH
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:border-usth-navy focus:ring-usth-navy"
                placeholder="your.email@usth.edu.vn"
              />
            </div>
            <p className="text-sm text-gray-500">
              Chúng tôi sẽ gửi mật khẩu mới đến email của bạn.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#d7263d] text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-[#b81f32] transition disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Gửi mật khẩu mới'}
            </button>
          </form>
        )}

        <div className="mt-8 text-sm text-slate-500">
          {authMode === 'login' ? (
            <div className="space-y-2">
              <p>
                Quên mật khẩu?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-usth-navy font-semibold"
                >
                  Khôi phục mật khẩu
                </button>
              </p>
              <p className="text-xs text-gray-400">
                Chỉ Admin mới có quyền tạo tài khoản. Vui lòng liên hệ Admin để được cấp tài khoản.
              </p>
            </div>
          ) : (
            <p>
              Quay lại{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setStatus(null)
                }}
                className="text-usth-navy font-semibold"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

