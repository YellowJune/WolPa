import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Save, Users } from 'lucide-react'

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

function DeskGrid({ classInfo, attendanceData, onDeskClick }) {
  const { students } = classInfo
  const desksPerRow = 4
  const rows = Math.ceil(students / desksPerRow)
  
  const desks = []
  for (let i = 0; i < students; i++) {
    desks.push(i + 1)
  }

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
            onClick={() => onDeskClick(deskNumber)}
            className={`
              relative w-12 h-10 sm:w-16 sm:h-12 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105
              ${isPresent 
                ? 'bg-green-500 border-green-600 text-white shadow-lg' 
                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
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

function PeriodSelectionModal({ isOpen, onClose, onSave }) {
  const [selectedPeriod, setSelectedPeriod] = useState('')

  const handleSave = () => {
    if (selectedPeriod) {
      onSave(selectedPeriod)
      onClose()
      setSelectedPeriod('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>교시 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="교시를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIODS).map(([key, period]) => (
                <SelectItem key={key} value={key}>
                  {period.name} ({period.score}점)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button onClick={handleSave} disabled={!selectedPeriod} className="flex-1">
              저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ManagePage() {
  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceData, setAttendanceData] = useState([])
  const [showPeriodModal, setShowPeriodModal] = useState(false)

  const handleDeskClick = (deskNumber) => {
    setAttendanceData(prev => {
      if (prev.includes(deskNumber)) {
        return prev.filter(num => num !== deskNumber)
      } else {
        return [...prev, deskNumber]
      }
    })
  }

  const handleSaveAttendance = () => {
    if (attendanceData.length === 0) {
      alert('출석할 학생을 선택해주세요.')
      return
    }
    setShowPeriodModal(true)
  }

  const handlePeriodSave = (period) => {
    const today = new Date().toISOString().split('T')[0]
    const attendanceRecord = {
      date: today,
      class: selectedClass,
      period: period,
      students: attendanceData,
      score: PERIODS[period].score
    }
    
    // 로컬 스토리지에서 기존 데이터 가져오기
    const existingData = JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
    
    // 같은 날짜, 반, 교시의 기존 기록 찾기
    const existingIndex = existingData.findIndex(record => 
      record.date === today && 
      record.class === selectedClass && 
      record.period === period
    )
    
    if (existingIndex !== -1) {
      // 기존 기록이 있으면 업데이트
      existingData[existingIndex] = attendanceRecord
      alert(`${selectedClass} ${period} 출석이 업데이트되었습니다. (${attendanceData.length}명 출석)`)
    } else {
      // 기존 기록이 없으면 새로 추가
      existingData.push(attendanceRecord)
      alert(`${selectedClass} ${period} 출석이 저장되었습니다. (${attendanceData.length}명 출석)`)
    }
    
    localStorage.setItem('attendanceRecords', JSON.stringify(existingData))
    setAttendanceData([])
  }

  const handleClassChange = (className) => {
    setSelectedClass(className)
    
    // 오늘 날짜의 기존 출석 데이터 확인
    const today = new Date().toISOString().split('T')[0]
    const existingData = JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
    
    // 해당 반의 오늘 출석 기록 찾기 (가장 최근 기록 우선)
    const todayRecords = existingData.filter(record => 
      record.date === today && record.class === className
    )
    
    if (todayRecords.length > 0) {
      // 가장 최근 기록의 출석 데이터 로드
      const latestRecord = todayRecords[todayRecords.length - 1]
      setAttendanceData(latestRecord.students || [])
    } else {
      setAttendanceData([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>반 선택</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(CLASS_INFO).map(([key, classInfo]) => (
              <Button
                key={key}
                variant={selectedClass === key ? "default" : "outline"}
                onClick={() => handleClassChange(key)}
                className="h-12"
              >
                <div className="text-center">
                  <div className="font-semibold">{classInfo.name}</div>
                  <div className="text-xs opacity-75">{classInfo.students}명</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Desk Layout */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {CLASS_INFO[selectedClass].name} 출석 체크
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              책상을 클릭하여 출석을 선택하세요 (선택됨: {attendanceData.length}명)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <DeskGrid 
              classInfo={CLASS_INFO[selectedClass]}
              attendanceData={attendanceData}
              onDeskClick={handleDeskClick}
            />
            
            {attendanceData.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleSaveAttendance}
                  className="flex items-center space-x-2 px-8"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  <span>출석 저장</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <PeriodSelectionModal
        isOpen={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        onSave={handlePeriodSave}
      />
    </div>
  )
}

