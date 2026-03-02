import { api, Class, CreateClassPayload } from '@/shared/api/client'

export const classesRepository = {
  async getAll(): Promise<Class[]> {
    return api.getClasses()
  },

  async create(data: CreateClassPayload, userId: string): Promise<Class> {
    return api.createClass(data, userId)
  },
}

