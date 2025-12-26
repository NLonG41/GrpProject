import { useMemo, useRef, useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import vi from 'date-fns/locale/vi'
import html2canvas from 'html2canvas'
import { useSchedules } from '../hooks/useSchedules'
import { ClassSchedule } from '@/shared/api/client'

const locales = {
  vi: vi,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  subject: string
  lecturer?: string
  room?: string
}

function ScheduleEvent({ event }: EventProps<CalendarEvent>) {
  return (
    <div className="space-y-0.5 leading-snug">
      <div className="font-semibold">{event.subject}</div>
      {event.lecturer && <div className="italic text-sm">{event.lecturer}</div>}
      {event.room && <div className="text-sm">{event.room}</div>}
    </div>
  )
}

export function StudentSchedule({ classId }: { classId?: string }) {
  const calendarRef = useRef<HTMLDivElement>(null)
  // Fetch all active schedules if no classId is provided (to show all schedules from Danh sách lịch học)
  const { schedules, loading, loadSchedules } = useSchedules(classId ? { classId, status: 'ACTIVE' } : { status: 'ACTIVE' })
  const [downloading, setDownloading] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // Real-time updates: poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadSchedules()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [loadSchedules])

  const events: CalendarEvent[] = useMemo(() => {
    if (!schedules) return []
    return schedules.map((s: ClassSchedule) => ({
      id: s.id,
      title: s.class?.subject?.name || s.class?.name || 'Lịch học',
      start: new Date(s.startTime),
      end: new Date(s.endTime),
      subject: s.class?.subject?.name || s.class?.name || 'Lịch học',
      lecturer: s.class?.lecturer?.fullName,
      room: s.room?.name ? `${s.room?.name}${s.room?.location ? ` • ${s.room.location}` : ''}` : undefined,
    }))
  }, [schedules])

  const handleDownload = async () => {
    if (!calendarRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(calendarRef.current, { scale: 2, useCORS: true })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `lich-hoc.png`
      link.click()
    } catch (error) {
      console.error('Failed to download image', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleSendEmail = () => {
    console.log('Sending email to student... (mock)')
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    // Find the full schedule data
    const schedule = schedules.find((s: ClassSchedule) => s.id === event.id)
    if (schedule) {
      setSelectedSchedule(schedule)
      setShowDetailsModal(true)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Lịch học sinh viên</h3>
          <p className="text-sm text-gray-500">Hiển thị theo tuần, có thể tải ảnh gửi cho sinh viên</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendEmail}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Gửi Email cho SV
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3 py-2 text-sm rounded-lg bg-usth-navy text-white hover:bg-usth-navy/90 disabled:opacity-50"
          >
            {downloading ? 'Đang xuất...' : 'Xuất ảnh Lịch'}
          </button>
        </div>
      </div>

      <div ref={calendarRef} className="border border-gray-200 rounded-lg p-2">
        <Calendar
          localizer={localizer}
          events={events}
          culture="vi"
          defaultDate={events.length ? events[0].start : new Date()}
          defaultView="week"
          views={['week', 'day']}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          components={{ event: ScheduleEvent }}
          step={30}
          timeslots={2}
          min={new Date(1970, 1, 1, 7, 0, 0)}
          max={new Date(1970, 1, 1, 21, 0, 0)}
          scrollToTime={new Date(1970, 1, 1, 7, 0, 0)}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#0b66c3',
              borderRadius: '8px',
              border: 'none',
              color: 'white',
              padding: '6px 8px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              cursor: 'pointer',
            },
          })}
          messages={{
            week: 'Tuần',
            day: 'Ngày',
            today: 'Hôm nay',
            previous: 'Trước',
            next: 'Sau',
            noEventsInRange: loading ? 'Đang tải...' : 'Không có lịch',
          }}
        />
      </div>

      {/* Schedule Details Modal */}
      {showDetailsModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Chi tiết lịch học</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedSchedule(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học</label>
                  <p className="text-gray-900 font-medium">{selectedSchedule.class?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                  <p className="text-gray-900 font-medium">{selectedSchedule.class?.subject?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng học</label>
                  <p className="text-gray-900">
                    {selectedSchedule.room?.name || 'N/A'}
                    {selectedSchedule.room?.location && ` - ${selectedSchedule.room.location}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                  <p className="text-gray-900">{selectedSchedule.room?.capacity || 'N/A'} chỗ</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảng viên</label>
                  <p className="text-gray-900">{selectedSchedule.class?.lecturer?.fullName || 'N/A'}</p>
                  {selectedSchedule.class?.lecturer?.email && (
                    <p className="text-sm text-gray-500">{selectedSchedule.class.lecturer.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại lịch</label>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedSchedule.type === 'MAIN' ? 'bg-blue-50 text-blue-600' :
                    selectedSchedule.type === 'MAKEUP' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {selectedSchedule.type === 'MAIN' ? 'Lịch chính' :
                     selectedSchedule.type === 'MAKEUP' ? 'Lịch bù' : 'Lịch thi'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                  <p className="text-gray-900">{formatDateTime(selectedSchedule.startTime)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                  <p className="text-gray-900">{formatDateTime(selectedSchedule.endTime)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedSchedule.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {selectedSchedule.status === 'ACTIVE' ? 'Hoạt động' : 'Đã hủy'}
                  </span>
                </div>
                {selectedSchedule.class?.subject?.credits && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tín chỉ</label>
                    <p className="text-gray-900">{selectedSchedule.class.subject.credits} tín chỉ</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedSchedule(null)
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

