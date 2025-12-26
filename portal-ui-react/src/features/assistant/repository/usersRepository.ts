import { api, User, CreateUserPayload } from '@/shared/api/client'

export const usersRepository = {
  async getAll(role?: string): Promise<User[]> {
    return api.getUsers(role)
  },

  async create(data: CreateUserPayload, adminUserId: string): Promise<{
    message: string
    user: User
    credentials?: { email: string; password: string }
  }> {
    return api.createUser(data, adminUserId)
  },

  async updateRole(
    userId: string,
    role: 'ADMIN' | 'ASSISTANT' | 'LECTURER' | 'STUDENT',
    adminUserId: string
  ): Promise<{ message: string; user: User }> {
    return api.updateUserRole(userId, role, adminUserId)
  },

  async resetPassword(
    userId: string,
    adminUserId: string
  ): Promise<{ message: string; credentials: { email: string; password: string } }> {
    return api.resetUserPassword(userId, adminUserId)
  },
}

