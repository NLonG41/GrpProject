import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'ASSISTANT' | 'STUDENT' | 'LECTURER'> // Optional, if not provided, allow all roles
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  console.log('[ProtectedRoute] Checking access...', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    allowedRoles
  })

  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] ❌ Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If allowedRoles is not provided or empty, allow all authenticated users
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) {
    console.warn('[ProtectedRoute] ⚠️ Role not allowed:', {
      userRole: user.role,
      allowedRoles
    })
    // Temporarily allow all roles - comment out the redirect
    // return <Navigate to="/login" replace />
    console.log('[ProtectedRoute] ⚠️ Temporarily allowing access (all roles enabled)')
  }

  console.log('[ProtectedRoute] ✅ Access granted')
  return <>{children}</>
}

