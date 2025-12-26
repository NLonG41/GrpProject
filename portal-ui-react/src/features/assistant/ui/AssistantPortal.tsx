import { useState } from 'react'
import { useAuthStore } from '@/shared/store/authStore'
import { UserManagement } from '../components/UserManagement'
import { SemesterManagement } from '../components/SemesterManagement'
import { SubjectManager } from '../components/SubjectManager'
import { RoomTable } from '../components/RoomTable'
import { SchedulingBoard } from '../components/SchedulingBoard'
import { StudentSchedule } from '../components/StudentSchedule'
import { RequestSection } from '../components/RequestSection'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'
import { ProfileModal } from '../components/ProfileModal'
import { NotificationPanel } from '../components/NotificationPanel'

type SectionKey = 'master' | 'scheduling' | 'requests' | 'analytics'
type SubSectionKey = 'users' | 'subjects' | 'classes' | 'rooms' | 'schedules' | null

interface MenuItem {
  key: SectionKey
  label: string
  icon: React.ReactNode
  subItems?: { key: SubSectionKey; label: string }[]
}

const menuItems: MenuItem[] = [
  {
    key: 'master',
    label: 'Quản lý Đào tạo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    subItems: [
      { key: 'users', label: 'Quản lý Người dùng' },
      { key: 'subjects', label: 'Quản lý Môn học' },
      { key: 'classes', label: 'Quản lý Lớp học' },
    ] as { key: SubSectionKey; label: string }[],
  },
  {
    key: 'scheduling',
    label: 'Xếp lịch & Tài nguyên',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    subItems: [
      { key: 'rooms', label: 'Quản lý Phòng học' },
      { key: 'schedules', label: 'Xếp lịch học' },
    ] as { key: SubSectionKey; label: string }[],
  },
  {
    key: 'requests',
    label: 'Request Center',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'analytics',
    label: 'Analytics Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export function AssistantPortal() {
  const [activeSection, setActiveSection] = useState<SectionKey>('master')
  const [activeSubSection, setActiveSubSection] = useState<SubSectionKey>('users')
  const [expandedItems, setExpandedItems] = useState<Set<SectionKey>>(new Set(['master']))
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  const toggleExpanded = (key: SectionKey) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedItems(newExpanded)
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <aside
        className={`fixed left-0 top-0 w-72 h-screen bg-gradient-to-b from-usth-navy to-usth-navy/95 text-white flex flex-col z-50 shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo & Branding */}
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60 font-medium">USTH</p>
              <p className="text-xl font-bold">Academic Desk</p>
            </div>
          </div>
          <p className="text-sm text-white/70 mt-1">Assistant Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const isActive = activeSection === item.key
            const isExpanded = expandedItems.has(item.key)
            const hasSubItems = item.subItems && item.subItems.length > 0

            return (
              <div key={item.key} className="mb-1">
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpanded(item.key)
                      // Set first sub-item as active when expanding
                      if (!expandedItems.has(item.key) && item.subItems && item.subItems.length > 0) {
                        setActiveSubSection(item.subItems[0].key)
                      }
                    } else {
                      setActiveSubSection(null)
                    }
                    setActiveSection(item.key)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg shadow-white/10'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {hasSubItems && (
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Sub-items */}
                {hasSubItems && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-white/10 pl-4">
                    {item.subItems.map((subItem) => {
                      const isSubActive = activeSection === item.key && activeSubSection === subItem.key
                      return (
                        <button
                          key={subItem.key}
                          onClick={() => {
                            setActiveSection(item.key)
                            setActiveSubSection(subItem.key)
                            // Close sidebar on mobile after selection
                            if (window.innerWidth < 1024) {
                              setSidebarOpen(false)
                            }
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                            isSubActive
                              ? 'text-white bg-white/15 font-medium'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>© {new Date().getFullYear()} USTH Academic Affairs</span>
          </div>
        </div>
      </aside>

      {/* Main Content - With left margin for fixed sidebar */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-sm text-gray-500">Xin chào</p>
              <h2 className="text-xl lg:text-2xl font-semibold">{user.fullName} • Academic Assistant</h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowNotificationPanel(true)}
              className="relative text-gray-500 hover:text-slate-900 transition p-2 rounded-lg hover:bg-gray-100"
            >
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
                <div className="h-12 w-12 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center overflow-hidden">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-14 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 text-sm z-50">
                  <button
                    onClick={() => {
                      setShowProfileModal(true)
                      setProfileMenuOpen(false)
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Xem hồ sơ
                    </div>
                  </button>
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-100">
          {/* Master Section - Sub-items */}
          {activeSection === 'master' && (
            <>
              {activeSubSection === 'users' && <UserManagement />}
              {activeSubSection === 'subjects' && <SubjectManager />}
              {activeSubSection === 'classes' && <SemesterManagement />}
              {!activeSubSection && <UserManagement />}
            </>
          )}

          {/* Scheduling Section - Sub-items */}
          {activeSection === 'scheduling' && (
            <>
              {activeSubSection === 'rooms' && <RoomTable />}
              {activeSubSection === 'schedules' && (
                <div className="space-y-6">
                  <SchedulingBoard />
                  <StudentSchedule />
                </div>
              )}
              {!activeSubSection && <RoomTable />}
            </>
          )}

          {/* Requests Section */}
          {activeSection === 'requests' && <RequestSection />}

          {/* Analytics Section */}
          {activeSection === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
        />
      )}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
      />
    </div>
  )
}

