// Shared public API
export { api, ApiError } from './api/client'
export { useAuthStore } from './store/authStore'
export type { User } from './store/authStore'
export { ProtectedRoute } from './components/ProtectedRoute'
export { db, app, analytics } from './config/firebase'

