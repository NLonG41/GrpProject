import { useSubjects } from '../hooks/useSubjects'
import { useClasses } from '../hooks/useClasses'

export function SubjectManager() {
  const { subjects, loading: subjectsLoading } = useSubjects()
  const { classes, loading: classesLoading } = useClasses()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Danh sách môn</h3>
            <p className="text-sm text-gray-500">CRUD đầy đủ + cấu hình tiên quyết.</p>
          </div>
          <button className="px-3 py-2 bg-slate-100 rounded-lg text-sm">+ Thêm môn</button>
        </div>
        <div className="space-y-4">
          {subjectsLoading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : subjects.length === 0 ? (
            <p className="text-gray-500">Chưa có môn học nào</p>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{subject.id}</p>
                    <p className="text-base font-semibold text-slate-900">{subject.name}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded-full">
                    {subject.credits} tín chỉ
                  </span>
                </div>
                <p className="text-sm text-gray-500">Khoa: {subject.faculty}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-lg text-slate-900 mb-4">Khởi tạo lớp học phần</h3>
        <div className="space-y-4">
          {classesLoading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : classes.length === 0 ? (
            <p className="text-gray-500">Chưa có lớp học nào</p>
          ) : (
            classes.map((cls) => (
              <div key={cls.id} className="border border-dashed border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">Lớp {cls.id}</p>
                <p className="font-semibold text-slate-900">{cls.subject?.name || cls.name}</p>
                <p className="text-sm text-gray-500">
                  Sinh viên: {cls.currentEnrollment}/{cls.maxCapacity}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

