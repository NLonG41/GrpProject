import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { LoginPage } from '@/features/auth'
import { AssistantPortal } from '@/features/assistant'
import { StudentPortal } from '@/features/student'
import { LecturerPortal } from '@/features/lecturer'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

function App() {
  const { user } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'ASSISTANT']}>
            <AssistantPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lecturer"
        element={
          <ProtectedRoute allowedRoles={['LECTURER']}>
            <LecturerPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                user.role === 'ADMIN' || user.role === 'ASSISTANT'
                  ? '/assistant'
                  : user.role === 'STUDENT'
                  ? '/student'
                  : user.role === 'LECTURER'
                  ? '/lecturer'
                  : '/login'
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App

