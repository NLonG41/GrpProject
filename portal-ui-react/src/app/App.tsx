import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { LoginPage } from '@/features/auth'
import { AssistantPortal } from '@/features/assistant'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

function App() {
  const { user } = useAuthStore()

  return (
    <>
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AssistantPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to="/assistant"
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
    </>
  )
}

export default App

