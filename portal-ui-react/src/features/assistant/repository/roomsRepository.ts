import { api, Room } from '@/shared/api/client'

export const roomsRepository = {
  async getAll(): Promise<Room[]> {
    return api.getRooms()
  },
}

