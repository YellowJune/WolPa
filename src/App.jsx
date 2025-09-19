import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Calendar, Users, Settings, BarChart3 } from 'lucide-react'
import schoolLogo from './assets/school-logo.jpg'
import ManagePage from './components/ManagePage.jsx'
import CheckLogPage from './components/CheckLogPage.jsx'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('manage') // 'manage' or 'checklog'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src={schoolLogo} 
                alt="현일고등학교 로고" 
                className="h-10 w-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">월파반 전자출석부</h1>
                <p className="text-sm text-gray-500">현일고등학교</p>
              </div>
            </div>
            
            {/* Page Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage === 'manage' ? 'checklog' : 'manage')}
              className="flex items-center space-x-2"
            >
              {currentPage === 'manage' ? (
                <>
                  <BarChart3 className="h-4 w-4" />
                  <span>출석 현황</span>
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  <span>출석 관리</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'manage' ? <ManagePage /> : <CheckLogPage />}
      </main>
    </div>
  )
}

export default App

