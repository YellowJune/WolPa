import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { BarChart3, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'

const CLASS_INFO = {
  '2R': { name: '2R', students: 22 },
  '2S': { name: '2S', students: 22 },
  '1R': { name: '1R', students: 20 },
  '1S-F': { name: '1S-F', students: 20 },
  '1S-M': { name: '1S-M', students: 14 }
}

const PERIODS = {
  '1교시': { name: '1교시', score: 0.6 },
  '3교시': { name: '3교시', score: 0.4 }
}

function AttendanceGrid({ classInfo, attendanceData }) {
  const { students } = classInfo
  const desksPerRow = 4
  const rows = Math.ceil(students / desksPerRow)
  
  // 좌측과 우측으로 나누어 배치 (좌측 2줄, 우측 2줄)
  const leftDesks = []
  const rightDesks = []
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 2; col++) {
      const deskNumber = row * desksPerRow + col + 1
      if (deskNumber <= students) {
        leftDesks.push(deskNumber)
      }
    }
    for (let col = 2; col < 4; col++) {
      const deskNumber = row * desksPerRow + col + 1
      if (deskNumber <= students) {
        rightDesks.push(deskNumber)
      }
    }
  }

  const renderDeskSection = (desks) => (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {desks.map((deskNumber) => {
        const isPresent = attendanceData.includes(deskNumber)
        return (
          <div
            key={deskNumber}
            className={`
              relative w-12 h-10 sm:w-16 sm:h-12 border-2 rounded-lg transition-all duration-200
              ${isPresent 
                ? 'bg-green-500 border-green-600 text-white shadow-lg' 
                : 'bg-red-100 border-red-300 text-red-600'
              }
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-semibold">{deskNumber}</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="flex justify-center">
      <div className="flex items-start space-x-4">
        {/* 좌측 책상들 */}
        {renderDeskSection(leftDesks)}
        
        {/* 통로 - 글씨 제거하고 간격만 유지 */}
        <div className="w-4"></div>
        
        {/* 우측 책상들 */}
        {renderDeskSection(rightDesks)}
      </div>
    </div>
  )
}

function AttendanceStats({ attendanceRecords, selectedDate, selectedPeriod, selectedClass }) {
  const filteredRecords = attendanceRecords.filter(record => {
    const matchDate = !selectedDate || record.date === format(selectedDate, 'yyyy-MM-dd')
    const matchPeriod = !selectedPeriod || record.period === selectedPeriod
    const matchClass = !selectedClass || record.class === selectedClass
    return matchDate && matchPeriod && matchClass
  })

  const totalStudents = selectedClass ? CLASS_INFO[selectedClass].students : 0
  const presentStudents = filteredRecords.length > 0 ? filteredRecords[0].students.length : 0
  const attendanceRate = totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(1) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">총 학생 수</p>
              <p className="text-2xl font-bold">{totalStudents}명</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">출석 학생 수</p>
              <p className="text-2xl font-bold text-green-600">{presentStudents}명</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">출석률</p>
              <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckLogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [filteredRecord, setFilteredRecord] = useState(null)

  useEffect(() => {
    // 로컬 스토리지에서 출석 기록 불러오기
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
    setAttendanceRecords(records)
  }, [])

  useEffect(() => {
    // 필터링된 출석 기록 찾기
    if (selectedDate && selectedPeriod && selectedClass) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const record = attendanceRecords.find(r => 
        r.date === dateStr && 
        r.period === selectedPeriod && 
        r.class === selectedClass
      )
      setFilteredRecord(record || null)
    } else {
      setFilteredRecord(null)
    }
  }, [selectedDate, selectedPeriod, selectedClass, attendanceRecords])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>출석 현황 조회</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">날짜 선택</label>
              <input
                type="date"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Period Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">교시 선택</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="교시를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIODS).map(([key, period]) => (
                    <SelectItem key={key} value={key}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">반 선택</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="반을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CLASS_INFO).map(([key, classInfo]) => (
                    <SelectItem key={key} value={key}>
                      {classInfo.name} ({classInfo.students}명)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedClass && (
        <AttendanceStats 
          attendanceRecords={attendanceRecords}
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
          selectedClass={selectedClass}
        />
      )}

      {/* Attendance Grid */}
      {selectedDate && selectedPeriod && selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {format(selectedDate, 'yyyy년 MM월 dd일')} {selectedPeriod} {selectedClass} 출석 현황
            </CardTitle>
            {filteredRecord && (
              <p className="text-center text-sm text-gray-600">
                출석: {filteredRecord.students.length}명 / 총 {CLASS_INFO[selectedClass].students}명
                (점수: {PERIODS[selectedPeriod].score}점)
              </p>
            )}
          </CardHeader>
          <CardContent>
            {filteredRecord ? (
              <AttendanceGrid 
                classInfo={CLASS_INFO[selectedClass]}
                attendanceData={filteredRecord.students}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                해당 날짜의 출석 기록이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Records */}
      {attendanceRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 출석 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendanceRecords.slice(-5).reverse().map((record, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{record.class}</span>
                    <span className="mx-2">•</span>
                    <span>{record.period}</span>
                    <span className="mx-2">•</span>
                    <span className="text-sm text-gray-600">{record.date}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{record.students.length}명 출석</div>
                    <div className="text-xs text-gray-500">{record.score}점</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

