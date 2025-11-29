import { useRequests } from '../hooks/useRequests'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export function RequestSection() {
  const { requests, loading } = useRequests()

  return (
    <section className="bg-white rounded-xl border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Request Center</h3>
          <p className="text-sm text-gray-500">Phê duyệt và đồng bộ real-time.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          Firebase channel: demo payload
        </span>
      </div>
      {loading ? (
        <div className="p-6 text-center text-gray-500">Đang tải...</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Mã yêu cầu</th>
              <th className="px-6 py-3 text-left">Giảng viên</th>
              <th className="px-6 py-3 text-left">Loại</th>
              <th className="px-6 py-3 text-left">Lý do</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
              <th className="px-6 py-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Chưa có yêu cầu nào
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">#{req.id}</td>
                  <td className="px-6 py-4">{req.sender?.fullName || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    {req.type === 'REQ_LEAVE' ? 'Xin nghỉ' : 'Dạy bù'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {(req.payload as { reason?: string })?.reason || req.adminNote || ''}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        statusColors[req.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition">
                      Duyệt
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition">
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

