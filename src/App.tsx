import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Dashboard from './components/Dashboard/Dashboard'
import ChartsSection from './components/Charts/ChartsSection'
import History from './components/History/History'
import TransactionModal from './components/TransactionModal/TransactionModal'
import { DateFilterProvider } from './contexts/DateFilterContext'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Router>
      <ProtectedRoute>
        <DateFilterProvider>
          <div className="min-h-screen bg-gray-50">
            <Header onAddTransaction={() => setIsModalOpen(true)} />
            <main>
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <Dashboard />
                      <ChartsSection />
                    </>
                  }
                />
                <Route path="/history" element={<History />} />
              </Routes>
            </main>
            <TransactionModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />
          </div>
        </DateFilterProvider>
      </ProtectedRoute>
    </Router>
  )
}

export default App

