import { api, LoginResponse } from '@/shared/api/client'

export const authRepository = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return api.login(email, password)
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
    return api.register(data)
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.forgotPassword(email)
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return api.changePassword(userId, currentPassword, newPassword)
  },
}

