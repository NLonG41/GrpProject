import { api, Request } from '@/shared/api/client'

export const requestsRepository = {
  async getAll(): Promise<Request[]> {
    return api.getRequests()
  },
}

