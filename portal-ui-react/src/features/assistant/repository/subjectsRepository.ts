import { api, Subject, CreateSubjectPayload } from '@/shared/api/client'

export const subjectsRepository = {
  async getAll(): Promise<Subject[]> {
    return api.getSubjects()
  },

  async create(data: CreateSubjectPayload, userId: string): Promise<Subject> {
    return api.createSubject(data, userId)
  },

  async bulkCreate(subjects: CreateSubjectPayload[], userId: string): Promise<{
    message: string
    results: {
      created: Subject[]
      skipped: Array<{ id: string; reason: string }>
      errors: Array<{ id: string; error: string }>
    }
  }> {
    return api.bulkCreateSubjects(subjects, userId)
  },
}

