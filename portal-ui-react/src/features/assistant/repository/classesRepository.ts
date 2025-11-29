import { api, Class } from '@/shared/api/client'

export const classesRepository = {
  async getAll(): Promise<Class[]> {
    return api.getClasses()
  },
}

