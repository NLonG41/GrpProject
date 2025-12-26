import { api, Request } from '@/shared/api/client'

export const requestsRepository = {
  async getAll(params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    type?: 'REQ_LEAVE' | 'REQ_MAKEUP'
    senderId?: string
    userId?: string
  }): Promise<Request[]> {
    return api.getRequests(params)
  },

  async getById(id: string, userId?: string): Promise<Request> {
    return api.getRequest(id, userId)
  },

  async approve(id: string, adminNote?: string, userId?: string): Promise<Request> {
    return api.updateRequest(id, {
      status: 'APPROVED',
      adminNote,
    }, userId)
  },

  async decline(id: string, adminNote?: string, userId?: string): Promise<Request> {
    return api.updateRequest(id, {
      status: 'REJECTED',
      adminNote,
    }, userId)
  },
}

