import { useState, useEffect } from 'react'
import { useClasses } from '../hooks/useClasses'
import { useUsers } from '../hooks/useUsers'
import { useEnrollments } from '../hooks/useEnrollments'
import { useSubjects } from '../hooks/useSubjects'
import { CreateSubjectPayload } from '@/shared/api/client'

export function SemesterManagement() {
  const { classes, loading: classesLoading, loadClasses } = useClasses()
  const { users } = useUsers()
  const { createSubject, loadSubjects } = useSubjects()
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [subjectForm, setSubjectForm] = useState<CreateSubjectPayload>({
    id: '',
    name: '',
    credits: 3,
    faculty: '',
    description: '',
  })

  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const { enrollments, loading: enrollmentsLoading, addEnrollment, removeEnrollment, loadEnrollments } = useEnrollments(
    selectedClassId || undefined
  )

  // Refresh classes immediately when component mounts or becomes visible
  useEffect(() => {
    console.log('[SemesterManagement] Component mounted/visible - refreshing data...')
    loadClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh enrollments when selected class changes
  useEffect(() => {
    if (selectedClassId) {
      loadEnrollments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId])

  // Filter students only
  const students = (users || []).filter((u) => u.role === 'STUDENT')
  
  // Get enrolled student IDs
  const enrolledStudentIds = new Set((enrollments || []).map((e) => e.studentId))
  
  // Available students (not enrolled yet)
  const availableStudents = students.filter((s) => !enrolledStudentIds.has(s.id))

  const handleAddStudent = async () => {
    if (!selectedClassId || !selectedStudentId) return
    
    try {
      await addEnrollment(selectedStudentId, selectedClassId)
      setShowAddModal(false)
      setSelectedStudentId('')
      // Refresh classes to update currentEnrollment
      await loadClasses()
      // Refresh enrollments for the selected class
      await loadEnrollments()
    } catch (error: any) {
      // Extract error message from various possible error structures
      let errorMessage = 'Có lỗi xảy ra khi thêm học sinh'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.error) {
        // Handle both string and object error formats
        errorMessage = typeof error.data.error === 'string' 
          ? error.data.error 
          : JSON.stringify(error.data.error)
      } else if (error?.error) {
        errorMessage = typeof error.error === 'string'
          ? error.error
          : JSON.stringify(error.error)
      }
      
      console.error('Error adding student:', error)
      alert(errorMessage)
    }
  }

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa học sinh này khỏi lớp?')) return
    
    try {
      await removeEnrollment(enrollmentId)
      // Refresh classes to update currentEnrollment
      await loadClasses()
      // Refresh enrollments for the selected class
      await loadEnrollments()
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa học sinh')
    }
  }

  const handleCreateSubject = async () => {
    if (!subjectForm.id || !subjectForm.name || !subjectForm.faculty || !subjectForm.credits) {
      alert('Vui lòng nhập đầy đủ mã, tên, khoa và số tín chỉ')
      return
    }
    try {
      await createSubject({
        ...subjectForm,
        description: subjectForm.description || undefined,
      })
      await loadSubjects()
      // Reset form
      setSubjectForm({
        id: '',
        name: '',
        credits: 3,
        faculty: '',
        description: '',
      })
      setShowSubjectModal(false)
      alert('Đã thêm môn học mới')
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.error || 'Không thể tạo môn học'
      alert(errorMessage)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Quản lý lớp học</h3>
          <p className="text-sm text-gray-500">
            Quản lý và chỉnh sửa danh sách học sinh trong các lớp học
          </p>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      <div className="p-6">
        {classesLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có lớp học nào</div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => {
              const classEnrollments = enrollments.filter((e) => e.classId === classItem.id)
              const isSelected = selectedClassId === classItem.id
              const enrollmentCount = classEnrollments.length

              return (
                <div
                  key={classItem.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'border-usth-navy bg-usth-navy/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">Lớp {classItem.id}</span>
                        <button
                          onClick={() => {
                            const newSelectedId = isSelected ? null : classItem.id
                            setSelectedClassId(newSelectedId)
                            if (newSelectedId) {
                              console.log('[SemesterManagement] Class selected, loading enrollments...')
                            }
                          }}
                          className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-usth-navy text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? 'Đang chọn' : 'Chọn lớp'}
                        </button>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {classItem.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Sinh viên: {classItem.currentEnrollment}/{classItem.maxCapacity}
                      </p>
                      {classItem.subject && (
                        <p className="text-xs text-gray-400 mt-1">
                          Môn: {classItem.subject.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-slate-900">
                          Danh sách học sinh ({enrollmentCount})
                        </h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              console.log('[SemesterManagement] Refreshing enrollments for class:', classItem.id)
                              loadEnrollments()
                            }}
                            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Làm mới danh sách"
                          >
                            🔄
                          </button>
                        <button
                          onClick={() => setShowAddModal(true)}
                          disabled={enrollmentCount >= classItem.maxCapacity}
                          className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          + Thêm học sinh
                        </button>
                        </div>
                      </div>

                      {enrollmentsLoading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Đang tải...</div>
                      ) : classEnrollments.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          Chưa có học sinh nào trong lớp
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {classEnrollments.map((enrollment) => {
                            const student = (users || []).find((u) => u.id === enrollment.studentId)
                            return (
                              <div
                                key={enrollment.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {student?.fullName || 'Unknown'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {student?.studentCode || 'N/A'} • {student?.email || 'N/A'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveStudent(enrollment.id)}
                                  className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                  Xóa
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Thêm học sinh vào lớp {selectedClass.name}
            </h3>
            
            {availableStudents.length === 0 ? (
              <p className="text-gray-500 mb-4">
                Tất cả học sinh đã được thêm vào lớp này hoặc đã đạt sức chứa tối đa.
              </p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn học sinh
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usth-navy focus:border-usth-navy"
                  >
                    <option value="">-- Chọn học sinh --</option>
                    {availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} ({student.studentCode || student.email})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedStudentId('')
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Hủy
              </button>
              {availableStudents.length > 0 && (
                <button
                  onClick={handleAddStudent}
                  disabled={!selectedStudentId}
                  className="px-4 py-2 rounded-lg bg-usth-navy text-white hover:bg-usth-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Thêm môn học mới</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã môn *</label>
                <input
                  value={subjectForm.id}
                  onChange={(e) => setSubjectForm({ ...subjectForm, id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="vd: sub-math101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn *</label>
                <input
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="vd: Toán học cơ bản"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tín chỉ *</label>
                  <input
                    type="number"
                    min={1}
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khoa *</label>
                  <input
                    value={subjectForm.faculty}
                    onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="vd: Khoa Toán"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Tùy chọn"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => {
                  setShowSubjectModal(false)
                  setSubjectForm({
                    id: '',
                    name: '',
                    credits: 3,
                    faculty: '',
                    description: '',
                  })
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateSubject}
                className="px-4 py-2 rounded-lg bg-usth-navy text-white hover:bg-usth-navy/90"
              >
                Thêm môn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
