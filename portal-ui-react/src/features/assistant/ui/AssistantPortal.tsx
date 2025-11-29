import { useState } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { UserManagement } from '../components/UserManagement'
import { SemesterManagement } from '../components/SemesterManagement'
import { SubjectManager } from '../components/SubjectManager'
import { RoomTable } from '../components/RoomTable'
import { SchedulingBoard } from '../components/SchedulingBoard'
import { RequestSection } from '../components/RequestSection'

const sections = [
  { key: 'master', label: 'Quản lý Đào tạo' },
  { key: 'scheduling', label: 'Xếp lịch & Tài nguyên' },
  { key: 'requests', label: 'Request Center' },
]

export function AssistantPortal() {
  const [activeSection, setActiveSection] = useState<'master' | 'scheduling' | 'requests'>('master')
  const { user, logout } = useAuthStore()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-usth-navy text-white pt-8 min-h-screen flex flex-col">
        <div className="px-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">USTH</p>
          <p className="text-2xl font-semibold">Academic Desk</p>
          <p className="text-sm text-white/70">Assistant Portal</p>
        </div>
        <nav className="mt-8 flex-1 space-y-2 px-4">
          {sections.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key as typeof activeSection)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeSection === item.key
                  ? 'bg-white/15 text-white shadow-subtle'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 text-xs text-white/60 border-t border-white/10">
          © {new Date().getFullYear()} USTH Academic Affairs
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">Xin chào</p>
            <h2 className="text-2xl font-semibold">
              {user.fullName} • {user.role === 'ADMIN' ? 'System Administrator' : 'Academic Assistant'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-slate-900 transition">
              <span className="sr-only">Notifications</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500"></span>
            </button>
            <div className="flex items-center gap-4 relative">
              <div className="text-right">
                <p className="text-sm font-semibold">Real-time Sync</p>
                <p className="text-xs text-gray-500">Firebase status: Demo</p>
              </div>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="h-12 w-12 rounded-full bg-gray-200 border border-gray-200"></div>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-14 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 text-sm">
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-1.5 text-left text-red-500 hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-100">
          {activeSection === 'master' && (
            <div className="space-y-8">
              <UserManagement />
              <SemesterManagement />
              <SubjectManager />
            </div>
          )}
          {activeSection === 'scheduling' && (
            <div className="space-y-8">
              <RoomTable />
              <SchedulingBoard />
            </div>
          )}
          {activeSection === 'requests' && <RequestSection />}
        </main>
      </div>
    </div>
  )
}

