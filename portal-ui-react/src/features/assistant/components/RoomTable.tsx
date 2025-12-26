import { useRooms } from '../hooks/useRooms'

export function RoomTable() {
  const { rooms, loading } = useRooms()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Quản lý phòng học</h3>
        <p className="text-sm text-gray-500">Thông tin phòng & trạng thái bảo trì.</p>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Phòng</th>
                <th className="px-4 py-3 text-left">Sức chứa</th>
                <th className="px-4 py-3 text-left">Địa điểm</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Chưa có phòng nào
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{room.name}</td>
                    <td className="px-4 py-3">{room.capacity} chỗ</td>
                    <td className="px-4 py-3">{room.location}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          room.isMaintenance
                            ? 'bg-red-50 text-red-600'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {room.isMaintenance ? 'Bảo trì' : 'Sẵn sàng'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

