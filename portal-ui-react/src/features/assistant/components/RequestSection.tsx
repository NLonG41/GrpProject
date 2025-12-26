import { useState } from 'react'
import { useRequests } from '../hooks/useRequests'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export function RequestSection() {
  const { requests, loading, error, approveRequest, declineRequest, loadRequests } = useRequests()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showNoteModal, setShowNoteModal] = useState<{
    id: string
    action: 'approve' | 'decline'
  } | null>(null)
  const [adminNote, setAdminNote] = useState('')

  const handleApprove = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn phê duyệt yêu cầu này?')) {
      setProcessingId(id)
      try {
        await approveRequest(id)
        alert('Đã phê duyệt yêu cầu thành công!')
      } catch (error) {
        alert('Có lỗi xảy ra khi phê duyệt yêu cầu')
      } finally {
        setProcessingId(null)
      }
    }
  }

  const handleDecline = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn từ chối yêu cầu này?')) {
      setProcessingId(id)
      try {
        await declineRequest(id)
        alert('Đã từ chối yêu cầu thành công!')
      } catch (error) {
        alert('Có lỗi xảy ra khi từ chối yêu cầu')
      } finally {
        setProcessingId(null)
      }
    }
  }

  const handleApproveWithNote = async () => {
    if (!showNoteModal) return
    setProcessingId(showNoteModal.id)
    try {
      await approveRequest(showNoteModal.id, adminNote)
      alert('Đã phê duyệt yêu cầu thành công!')
      setShowNoteModal(null)
      setAdminNote('')
    } catch (error) {
      alert('Có lỗi xảy ra khi phê duyệt yêu cầu')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeclineWithNote = async () => {
    if (!showNoteModal) return
    setProcessingId(showNoteModal.id)
    try {
      await declineRequest(showNoteModal.id, adminNote)
      alert('Đã từ chối yêu cầu thành công!')
      setShowNoteModal(null)
      setAdminNote('')
    } catch (error) {
      alert('Có lỗi xảy ra khi từ chối yêu cầu')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Request Center</h3>
            <p className="text-sm text-gray-500">Quản lý và phê duyệt các yêu cầu từ giảng viên</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadRequests()}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
              {requests.length} yêu cầu
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-red-600 mb-2">Lỗi: {error}</p>
            <p className="text-sm text-gray-500 mb-4">Không thể tải danh sách yêu cầu</p>
            <button
              onClick={() => loadRequests()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Mã yêu cầu</th>
                  <th className="px-6 py-3 text-left">Giảng viên</th>
                  <th className="px-6 py-3 text-left">Loại</th>
                  <th className="px-6 py-3 text-left">Nội dung</th>
                  <th className="px-6 py-3 text-left">Trạng thái</th>
                  <th className="px-6 py-3 text-left">Ngày tạo</th>
                  <th className="px-6 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Chưa có yêu cầu nào</p>
                        <p className="text-sm text-gray-400 mt-1">Các yêu cầu từ giảng viên sẽ hiển thị ở đây</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <span className="font-mono text-xs">#{req.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{req.sender?.fullName || 'Unknown'}</span>
                          <span className="text-xs text-gray-500">{req.sender?.email || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                          {req.type === 'REQ_LEAVE' ? 'Xin nghỉ' : 
                           req.type === 'REQ_MAKEUP' ? 'Dạy bù' :
                           req.type === 'CLASS_SWAP' ? 'Đổi lớp' :
                           req.type === 'ABSENCE_REQUEST' ? 'Xin nghỉ' :
                           req.type === 'ENROLLMENT' ? 'Đăng ký' :
                           req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs">
                        <div className="truncate" title={JSON.stringify(req.payload, null, 2)}>
                          {(req.payload as { reason?: string; toClass?: string; classId?: string })?.reason || 
                           (req.payload as { reason?: string; toClass?: string; classId?: string })?.toClass ||
                           (req.payload as { reason?: string; toClass?: string; classId?: string })?.classId ||
                           req.adminNote || 
                           'Không có mô tả'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[req.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {req.status === 'PENDING' ? 'Chờ duyệt' :
                           req.status === 'APPROVED' ? 'Đã duyệt' :
                           req.status === 'REJECTED' ? 'Đã từ chối' :
                           req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(req.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {req.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={processingId === req.id}
                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                title="Phê duyệt yêu cầu"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {processingId === req.id ? 'Đang xử lý...' : 'Duyệt'}
                              </button>
                              <button
                                onClick={() => handleDecline(req.id)}
                                disabled={processingId === req.id}
                                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                title="Từ chối yêu cầu"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {processingId === req.id ? 'Đang xử lý...' : 'Từ chối'}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              {req.status === 'APPROVED' ? '✓ Đã duyệt' : '✗ Đã từ chối'}
                            </span>
                          )}
                        </div>
                        {req.adminNote && (
                          <div className="mt-2 text-xs text-gray-500 italic">
                            Ghi chú: {req.adminNote}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {showNoteModal.action === 'approve' ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
            </h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú (tùy chọn)..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNoteModal(null)
                  setAdminNote('')
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={
                  showNoteModal.action === 'approve'
                    ? handleApproveWithNote
                    : handleDeclineWithNote
                }
                disabled={processingId === showNoteModal.id}
                className={`px-4 py-2 rounded-lg text-white ${
                  showNoteModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processingId === showNoteModal.id ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

