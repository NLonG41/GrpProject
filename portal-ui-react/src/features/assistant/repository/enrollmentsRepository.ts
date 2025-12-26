import { api, Enrollment } from '@/shared/api/client'

export const enrollmentsRepository = {
  async getAll(params?: {
    studentId?: string
    classId?: string
  }): Promise<Enrollment[]> {
    return api.getEnrollments(params)
  },

  async getById(id: string): Promise<Enrollment> {
    return api.getEnrollment(id)
  },

  async create(data: {
    studentId: string
    classId: string
  }, userId: string): Promise<Enrollment> {
    return api.createEnrollment(data, userId)
  },

  async update(id: string, data: {
    midtermScore?: number
    finalScore?: number
    totalGrade?: number
  }): Promise<Enrollment> {
    return api.updateEnrollment(id, data)
  },

  async delete(id: string): Promise<void> {
    return api.deleteEnrollment(id)
  },
}
