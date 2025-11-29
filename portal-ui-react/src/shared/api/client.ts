// API Client for Core Service (Service A)
const CORE_API = import.meta.env.VITE_CORE_API || 'http://localhost:4000'
const REALTIME_API = import.meta.env.VITE_REALTIME_API || 'http://localhost:5002'

// Types
export interface LoginResponse {
  user: {
    id: string
    email: string
    role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT'
    fullName: string
    studentCode?: string
    cohort?: string
    major?: string
    department?: string
    specialty?: string
    createdAt: string
    updatedAt: string
  }
  message: string
}

export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT'
  fullName: string
  studentCode?: string
  cohort?: string
  major?: string
  department?: string
  specialty?: string
  createdAt: string
  updatedAt?: string
}

export interface Subject {
  id: string
  name: string
  credits: number
  faculty: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  subjectId: string
  lecturerId: string
  name: string
  maxCapacity: number
  currentEnrollment: number
  isActive: boolean
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  subject?: Subject
  lecturer?: User
}

export interface Room {
  id: string
  name: string
  capacity: number
  location: string
  isMaintenance: boolean
  createdAt: string
  updatedAt: string
}

export interface Request {
  id: string
  senderId: string
  type: 'REQ_LEAVE' | 'REQ_MAKEUP'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  payload: Record<string, unknown>
  adminNote?: string
  createdAt: string
  updatedAt: string
  sender?: User
}

export interface CreateUserPayload {
  fullName: string
  email: string
  role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT'
  studentCode?: string
  cohort?: string
  major?: string
  department?: string
  specialty?: string
  sendEmail?: boolean
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    )
  }
  return response.json()
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${CORE_API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<LoginResponse>(res)
  },

  async register(data: {
    fullName: string
    email: string
    password: string
    role?: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT'
    studentCode?: string
    cohort?: string
    major?: string
    department?: string
    specialty?: string
  }): Promise<LoginResponse> {
    const res = await fetch(`${CORE_API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<LoginResponse>(res)
  },

  // Users
  async getUsers(role?: string): Promise<User[]> {
    const url = role ? `${CORE_API}/api/users?role=${role}` : `${CORE_API}/api/users`
    const res = await fetch(url)
    return handleResponse<User[]>(res)
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${CORE_API}/api/subjects`)
    return handleResponse<Subject[]>(res)
  },

  // Classes
  async getClasses(): Promise<Class[]> {
    const res = await fetch(`${CORE_API}/api/classes`)
    return handleResponse<Class[]>(res)
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const res = await fetch(`${CORE_API}/api/rooms`)
    return handleResponse<Room[]>(res)
  },

  // Schedules
  async createSchedule(data: {
    classId: string
    roomId: string
    startTime: string
    endTime: string
    type?: 'MAIN' | 'MAKEUP' | 'EXAM'
  }): Promise<unknown> {
    const res = await fetch(`${CORE_API}/api/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // Requests
  async getRequests(): Promise<Request[]> {
    const res = await fetch(`${CORE_API}/api/requests`)
    return handleResponse<Request[]>(res)
  },

  // Notifications (Service B)
  async createNotification(data: {
    toUserId: string
    fromUserId: string
    type: string
    title: string
    message: string
  }): Promise<unknown> {
    const res = await fetch(`${REALTIME_API}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async getNotifications(userId: string, unread = false): Promise<unknown[]> {
    const url = `${REALTIME_API}/notifications/${userId}${unread ? '?unread=true' : ''}`
    const res = await fetch(url)
    return handleResponse<unknown[]>(res)
  },

  // User Management (Admin only)
  async createUser(data: CreateUserPayload, adminUserId: string): Promise<{
    message: string
    user: User
    credentials?: { email: string; password: string }
  }> {
    const res = await fetch(`${CORE_API}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': adminUserId,
      },
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async updateUserRole(
    userId: string,
    role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT',
    adminUserId: string
  ): Promise<{ message: string; user: User }> {
    const res = await fetch(`${CORE_API}/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': adminUserId,
      },
      body: JSON.stringify({ role }),
    })
    return handleResponse(res)
  },

  // Password management
  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${CORE_API}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return handleResponse(res)
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const res = await fetch(`${CORE_API}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    })
    return handleResponse(res)
  },
}

export { ApiError }

