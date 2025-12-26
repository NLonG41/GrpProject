// API Client for Core Service (Service A)
const CORE_API = import.meta.env.VITE_CORE_API || 'http://localhost:4000'
const REALTIME_API = import.meta.env.VITE_REALTIME_API || 'http://localhost:5002'

// Types
export interface LoginResponse {
  user: {
    id: string
    email: string
    role: 'ASSISTANT'
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
  role: 'ASSISTANT'
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

export interface CreateSubjectPayload {
  id: string
  name: string
  credits: number
  faculty: string
  description?: string
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

export interface Enrollment {
  id: string
  studentId: string
  classId: string
  registeredAt: string
  student?: User
  class?: Class
}

export interface ClassSchedule {
  id: string
  classId: string
  roomId: string
  startTime: string
  endTime: string
  type: 'MAIN' | 'MAKEUP' | 'EXAM'
  status: 'ACTIVE' | 'CANCELLED'
  createdAt?: string
  updatedAt?: string
  class?: {
    id: string
    name: string
    subject?: Subject
    lecturer?: {
      id: string
      fullName: string
      email?: string
    }
  }
  room?: {
    id: string
    name: string
    location?: string
    capacity?: number
  }
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
  role: 'ASSISTANT'
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

// Helper to get auth headers with x-user-id
function getAuthHeaders(userId?: string): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (userId) {
    headers['x-user-id'] = userId
  }
  return headers
}

// Helper to check if backend is reachable
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${CORE_API}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    return response.ok
  } catch (error) {
    return false
  }
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

  async firebaseLogin(idToken: string): Promise<LoginResponse> {
    console.log('[api] firebaseLogin called', {
      url: `${CORE_API}/api/auth/firebase-login`,
      tokenLength: idToken.length,
      tokenPreview: idToken.substring(0, 50) + '...'
    })
    
    try {
      const res = await fetch(`${CORE_API}/api/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      
      console.log('[api] firebaseLogin response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[api] firebaseLogin error response:', errorData)
        throw new ApiError(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData
        )
      }
      
      const data = await res.json()
      console.log('[api] firebaseLogin success:', data)
      return data
    } catch (error: any) {
      console.error('[api] firebaseLogin exception:', error)
      throw error
    }
  },

  async register(data: {
    fullName: string
    email: string
    password: string
    role?: 'ASSISTANT'
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
    console.log('[api] getUsers called', { url, role })
    
    try {
      const res = await fetch(url)
      console.log('[api] getUsers response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[api] getUsers error response:', errorData)
        throw new ApiError(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData
        )
      }
      
      const data = await res.json()
      console.log('[api] getUsers success:', { count: data.length, users: data })
      return data
    } catch (error: any) {
      console.error('[api] getUsers exception:', error)
      throw error
    }
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    console.log('[api] getSubjects called', { url: `${CORE_API}/api/subjects` })
    
    try {
      const res = await fetch(`${CORE_API}/api/subjects`)
      console.log('[api] getSubjects response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[api] getSubjects error response:', errorData)
        throw new ApiError(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData
        )
      }
      
      const data = await res.json()
      console.log('[api] getSubjects success:', { count: data.length, subjects: data })
      return data
    } catch (error: any) {
      console.error('[api] getSubjects exception:', error)
      throw error
    }
  },

  async createSubject(data: CreateSubjectPayload, userId: string): Promise<Subject> {
    try {
      const res = await fetch(`${CORE_API}/api/subjects`, {
        method: 'POST',
        headers: getAuthHeaders(userId),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData
        )
      }
      
      const result = await res.json()
      return result
    } catch (error: any) {
      throw error
    }
  },

  async bulkCreateSubjects(subjects: CreateSubjectPayload[], userId: string): Promise<{
    message: string
    results: {
      created: Subject[]
      skipped: Array<{ id: string; reason: string }>
      errors: Array<{ id: string; error: string }>
    }
  }> {
    try {
      const res = await fetch(`${CORE_API}/api/subjects/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(userId),
        body: JSON.stringify({ subjects }),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData
        )
      }
      
      return await res.json()
    } catch (error: any) {
      throw error
    }
  },

  // Classes
  async getClasses(): Promise<Class[]> {
    console.log('[api] getClasses called', { url: `${CORE_API}/api/classes` })
    
    try {
      const res = await fetch(`${CORE_API}/api/classes`)
      console.log('[api] getClasses response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[api] getClasses error response:', errorData)
        throw new ApiError(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData
        )
      }
      
      const data = await res.json()
      console.log('[api] getClasses success:', { count: data.length, classes: data })
      return data
    } catch (error: any) {
      console.error('[api] getClasses exception:', error)
      throw error
    }
  },

  // Schedules
  async getSchedules(params?: {
    classId?: string
    roomId?: string
    status?: 'ACTIVE' | 'CANCELLED'
    type?: 'MAIN' | 'MAKEUP' | 'EXAM'
  }): Promise<ClassSchedule[]> {
    const query = new URLSearchParams()
    if (params?.classId) query.append('classId', params.classId)
    if (params?.roomId) query.append('roomId', params.roomId)
    if (params?.status) query.append('status', params.status)
    if (params?.type) query.append('type', params.type)

    const url = `${CORE_API}/api/schedules${query.toString() ? `?${query.toString()}` : ''}`
    const res = await fetch(url)
    return handleResponse<ClassSchedule[]>(res)
  },

  async createSchedule(data: {
    classId: string
    roomId: string
    startTime: string
    endTime: string
    type?: 'MAIN' | 'MAKEUP' | 'EXAM'
    repeatType?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'WEEKLY_DAYS'
    repeatEndDate?: string
    numberOfSessions?: number
    repeatDaysOfWeek?: number[]
    startTimeOfDay?: string // Format: "HH:mm" (ví dụ: "09:25")
    endTimeOfDay?: string // Format: "HH:mm" (ví dụ: "12:05")
  }, userId: string): Promise<ClassSchedule | { message: string; schedules: ClassSchedule[] }> {
    const res = await fetch(`${CORE_API}/api/schedules`, {
      method: 'POST',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    })
    return handleResponse<ClassSchedule>(res)
  },

  async updateSchedule(
    id: string,
    data: Partial<{
      roomId: string
      startTime: string
      endTime: string
      type: 'MAIN' | 'MAKEUP' | 'EXAM'
      status: 'ACTIVE' | 'CANCELLED'
    }>,
    userId: string
  ): Promise<ClassSchedule> {
    const res = await fetch(`${CORE_API}/api/schedules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userId),
      body: JSON.stringify(data),
    })
    return handleResponse<ClassSchedule>(res)
  },

  async deleteSchedule(id: string, userId: string): Promise<void> {
    const res = await fetch(`${CORE_API}/api/schedules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userId),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new ApiError(
        errorData.error || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      )
    }
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const res = await fetch(`${CORE_API}/api/rooms`)
    return handleResponse<Room[]>(res)
  },

  async checkRoomAvailability(
    roomId: string,
    startTime: string,
    endTime: string,
    excludeScheduleId?: string,
    excludeClassId?: string
  ): Promise<{
    roomId: string
    roomName: string
    isAvailable: boolean
    isLocked: boolean
    conflictingSchedule: {
      id: string
      className: string
      subjectName: string
      startTime: string
      endTime: string
    } | null
  }> {
    const query = new URLSearchParams()
    query.append('startTime', startTime)
    query.append('endTime', endTime)
    if (excludeScheduleId) query.append('excludeScheduleId', excludeScheduleId)
    if (excludeClassId) query.append('excludeClassId', excludeClassId)
    
    const res = await fetch(`${CORE_API}/api/rooms/${roomId}/availability?${query.toString()}`)
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
    role: 'ASSISTANT',
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

  // Enrollments
  async getEnrollments(params?: {
    studentId?: string
    classId?: string
  }): Promise<Enrollment[]> {
    const queryParams = new URLSearchParams()
    if (params?.studentId) queryParams.append('studentId', params.studentId)
    if (params?.classId) queryParams.append('classId', params.classId)
    
    const url = `${CORE_API}/api/enrollments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const res = await fetch(url)
    return handleResponse<Enrollment[]>(res)
  },

  async getEnrollment(id: string): Promise<Enrollment> {
    const res = await fetch(`${CORE_API}/api/enrollments/${id}`)
    return handleResponse<Enrollment>(res)
  },

  async createEnrollment(data: {
    studentId: string
    classId: string
  }, userId: string): Promise<Enrollment> {
    try {
      const res = await fetch(`${CORE_API}/api/enrollments`, {
        method: 'POST',
        headers: getAuthHeaders(userId),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData
        )
      }
      
      return await res.json()
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error.message || 'Failed to create enrollment',
        0,
        {}
      )
    }
  },

  async updateEnrollment(id: string, data: {
    midtermScore?: number
    finalScore?: number
    totalGrade?: number
  }): Promise<Enrollment> {
    const res = await fetch(`${CORE_API}/api/enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Enrollment>(res)
  },

  async deleteEnrollment(id: string): Promise<void> {
    const res = await fetch(`${CORE_API}/api/enrollments/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new ApiError(
        errorData.error || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      )
    }
  },

  // Analytics
  async getAnalyticsDashboard(userId: string): Promise<{
    users: {
      total: number
      byRole: {
        ADMIN: number
        ASSISTANT: number
        LECTURER: number
        STUDENT: number
      }
      newThisMonth: number
    }
    subjects: {
      total: number
      active: number
    }
    classes: {
      total: number
      active: number
      full: number
      available: number
    }
    enrollments: {
      total: number
      averagePerClass: number
      mostEnrolledClass: {
        id: string
        name: string
        subjectName: string
        enrollmentCount: number
      } | null
      bySubject: Array<{
        subjectId: string
        subjectName: string
        enrollmentCount: number
      }>
    }
    requests: {
      total: number
      pending: number
      approved: number
      rejected: number
      approvalRate: number
      byType: {
        REQ_LEAVE: number
        REQ_MAKEUP: number
      }
    }
    schedules: {
      totalThisWeek: number
      totalThisMonth: number
      mostUsedRoom: {
        id: string
        name: string
        location: string
        usageCount: number
      } | null
    }
  }> {
    const res = await fetch(`${CORE_API}/api/analytics/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(userId),
    })
    return handleResponse(res)
  },
}

export { ApiError }

