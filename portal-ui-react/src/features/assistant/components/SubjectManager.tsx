import { useState } from 'react'
import { useSubjects } from '../hooks/useSubjects'
import { useClasses } from '../hooks/useClasses'
import { useUsers } from '../hooks/useUsers'
import { CreateSubjectPayload } from '@/shared/api/client'

export function SubjectManager() {
  const { subjects, loading: subjectsLoading, bulkCreateSubjects, loadSubjects } = useSubjects()
  const { createClass, classes } = useClasses()
  const { users } = useUsers()
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [subjectForm, setSubjectForm] = useState<CreateSubjectPayload>({
    id: '',
    name: '',
    credits: 3,
    faculty: '',
    description: '',
  })
  const [rows, setRows] = useState<Array<{
    id: string
    name: string
    credits: string
    faculty: string
    description: string
  }>>([
    { id: '', name: '', credits: '3', faculty: '', description: '' },
  ])

  const handleCreateClassFromSubject = async (subject: { id: string; name: string }) => {
    // Chỉ dùng lecturer chắc chắn tồn tại và đang được tham chiếu bởi class hiện có
    const validLecturerIds = new Set(classes.map((c) => c.lecturerId))
    const lecturer = users.find((u) => u.role === 'LECTURER' && validLecturerIds.has(u.id))

    if (!lecturer) {
      alert('Không tìm thấy giảng viên hợp lệ trong dữ liệu hiện tại. Vui lòng tạo/seed lại lớp có lecturer hợp lệ hoặc chọn giảng viên tồn tại trong DB.')
      return
    }

    const now = Date.now()
    const classId = `class-${subject.id}-${now}`

    try {
      setIsProcessing(true)
      await createClass({
        id: classId,
        subjectId: subject.id,
        lecturerId: lecturer.id,
        name: `${subject.name} Class`,
        maxCapacity: 40,
        startDate: new Date(new Date().getFullYear(), 1, 1).toISOString(),
        endDate: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).toISOString(),
        isActive: true,
      })
      alert(`Đã tạo lớp ${classId} cho môn ${subject.name}`)
    } catch (error: any) {
      const msg = String(error?.message || '')
      if (msg.includes('P2003') || msg.includes('Foreign key constraint')) {
        alert('Không thể tạo lớp: lecturerId không tồn tại trong DB. Hãy đồng bộ user/DB hoặc đăng nhập lại rồi thử lại.')
      } else {
        alert(error?.message || 'Không thể tạo lớp từ môn học')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkCreate = async () => {
    const subjectsToCreate: CreateSubjectPayload[] = rows
      .map((r) => ({
        id: r.id.trim(),
        name: r.name.trim(),
        credits: Number(r.credits),
        faculty: r.faculty.trim(),
        description: r.description.trim() || undefined,
      }))
      .filter(
        (r) =>
          r.id &&
          r.name &&
          r.faculty &&
          !Number.isNaN(r.credits) &&
          r.credits > 0,
      )

    if (subjectsToCreate.length === 0) {
      alert('Chưa có dòng nào hợp lệ. Vui lòng nhập Mã, Tên, Tín chỉ (>0), Khoa.')
      return
    }

    setIsProcessing(true)
    try {
      const result = await bulkCreateSubjects(subjectsToCreate)
      const { created, skipped, errors } = result.results

      let message = `Đã tạo thành công ${created.length} môn học.\n`
      if (skipped.length > 0) {
        message += `Bỏ qua ${skipped.length} môn (đã tồn tại).\n`
        message += `- ${skipped.map((s) => `${s.id}: ${s.reason}`).join('\n- ')}\n`
      }
      if (errors.length > 0) {
        message += `Lỗi ${errors.length} môn.\n`
        message += `- ${errors.map((e) => `${e.id}: ${e.error}`).join('\n- ')}\n`
      }

      alert(message)
      setShowBulkModal(false)
      setRows([{ id: '', name: '', credits: '3', faculty: '', description: '' }])
      await loadSubjects()
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể tạo môn học'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateSubject = async () => {
    if (!subjectForm.id.trim() || !subjectForm.name.trim() || !subjectForm.faculty.trim()) {
      alert('Vui lòng nhập Mã môn, Tên môn và Khoa')
      return
    }
    if (!subjectForm.credits || Number(subjectForm.credits) <= 0) {
      alert('Số tín chỉ phải > 0')
      return
    }
    try {
      setIsProcessing(true)
      await bulkCreateSubjects([
        {
          id: subjectForm.id.trim(),
          name: subjectForm.name.trim(),
          credits: Number(subjectForm.credits),
          faculty: subjectForm.faculty.trim(),
          description: subjectForm.description?.trim() || undefined,
        },
      ])
      await loadSubjects()
      setSubjectForm({ id: '', name: '', credits: 3, faculty: '', description: '' })
      setShowAddModal(false)
      alert('Đã tạo môn học')
    } catch (error: any) {
      alert(error?.message || 'Không thể tạo môn học')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Danh sách môn</h3>

          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3 py-2 bg-usth-navy text-white rounded-lg text-sm hover:bg-usth-sky transition"
            >
              + Thêm môn
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {subjectsLoading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Chưa có môn học nào</p>
              <p className="text-xs text-gray-400">Hãy thêm môn học đầu tiên</p>
            </div>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{subject.id}</p>
                    <p className="text-base font-semibold text-slate-900">{subject.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded-full">
                      {subject.credits} tín chỉ
                    </span>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleCreateClassFromSubject(subject)}
                      className="px-3 py-1 text-xs rounded-lg bg-usth-navy text-white hover:bg-usth-sky disabled:opacity-50"
                    >
                      Tạo lớp từ môn này
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Khoa: {subject.faculty}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Thêm danh sách môn học</h3>
            
            <div className="mb-3 text-sm text-gray-600">
              Nhập từng dòng theo cột: Mã môn, Tên môn, Số tín chỉ, Khoa, Mô tả (tùy chọn).
            </div>

            <div className="mb-3 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 px-1">
                <div className="col-span-2">Mã môn *</div>
                <div className="col-span-3">Tên môn *</div>
                <div className="col-span-2">Số tín chỉ *</div>
                <div className="col-span-3">Khoa *</div>
                <div className="col-span-2">Mô tả</div>
              </div>
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="sub-math101"
                      value={row.id}
                      onChange={(e) => {
                        const next = [...rows]
                        next[idx].id = e.target.value
                        setRows(next)
                      }}
                    />
                    <input
                      className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Toán học cơ bản"
                      value={row.name}
                      onChange={(e) => {
                        const next = [...rows]
                        next[idx].name = e.target.value
                        setRows(next)
                      }}
                    />
                    <input
                      className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm"
                      type="number"
                      min={1}
                      placeholder="3"
                      value={row.credits}
                      onChange={(e) => {
                        const next = [...rows]
                        next[idx].credits = e.target.value
                        setRows(next)
                      }}
                    />
                    <input
                      className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Khoa Toán"
                      value={row.faculty}
                      onChange={(e) => {
                        const next = [...rows]
                        next[idx].faculty = e.target.value
                        setRows(next)
                      }}
                    />
                    <div className="col-span-2 flex gap-1">
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Mô tả ngắn"
                        value={row.description}
                        onChange={(e) => {
                          const next = [...rows]
                          next[idx].description = e.target.value
                          setRows(next)
                        }}
                      />
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = rows.filter((_, i) => i !== idx)
                            setRows(next.length ? next : [{ id: '', name: '', credits: '3', faculty: '', description: '' }])
                          }}
                          className="px-2 text-xs text-red-600 hover:text-red-800"
                          title="Xóa dòng"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Đã nhập: {rows.filter(r => r.id && r.name && r.faculty && !Number.isNaN(Number(r.credits)) && Number(r.credits) > 0).length} môn hợp lệ</span>
                <button
                  type="button"
                  onClick={() => setRows([...rows, { id: '', name: '', credits: '3', faculty: '', description: '' }])}
                  className="text-usth-navy hover:underline"
                >
                  + Thêm dòng
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => {
                  setShowBulkModal(false)
                  setRows([{ id: '', name: '', credits: '3', faculty: '', description: '' }])
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button
                onClick={handleBulkCreate}
                disabled={
                  isProcessing ||
                  rows.every(
                    (r) =>
                      !r.id.trim() &&
                      !r.name.trim() &&
                      !r.faculty.trim() &&
                      (!r.credits || !`${r.credits}`.trim())
                  )
                }
                className="px-4 py-2 bg-usth-navy text-white rounded-lg hover:bg-usth-sky disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Đang xử lý...' : 'Thêm danh sách'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Single Create Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Thêm môn học mới</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã môn *</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="vd: sub-math101"
                  value={subjectForm.id}
                  onChange={(e) => setSubjectForm({ ...subjectForm, id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn *</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="vd: Toán học cơ bản"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tín chỉ *</label>
                <input
                  type="number"
                    min={1}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khoa *</label>
                <input
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="vd: Khoa Toán"
                    value={subjectForm.faculty}
                    onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
                />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                  placeholder="Tùy chọn"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
                <button
                onClick={() => {
                  setShowAddModal(false)
                  setSubjectForm({ id: '', name: '', credits: 3, faculty: '', description: '' })
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                disabled={isProcessing}
                >
                  Hủy
                </button>
                <button
                onClick={handleCreateSubject}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-usth-navy text-white hover:bg-usth-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isProcessing ? 'Đang lưu...' : 'Thêm môn'}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
