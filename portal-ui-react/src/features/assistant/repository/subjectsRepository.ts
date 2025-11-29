import { api, Subject } from '@/shared/api/client'

export const subjectsRepository = {
  async getAll(): Promise<Subject[]> {
    return api.getSubjects()
  },
}

