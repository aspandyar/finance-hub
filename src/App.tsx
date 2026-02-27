import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Dashboard from './components/Dashboard/Dashboard'
import ChartsSection from './components/Charts/ChartsSection'
import History from './components/History/History'
import RecurringTransactions from './components/RecurringTransactions/RecurringTransactions'
import TransactionModal from './components/TransactionModal/TransactionModal'
import AuthModal from './components/Auth/AuthModal'
import { DateFilterProvider } from './contexts/DateFilterContext'
import { useAuth } from './contexts/AuthContext'
import { AuthModalProvider } from './contexts/AuthModalContext'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  // Close auth modal when user successfully logs in
  useEffect(() => {
    if (isAuthenticated) {
      setAuthModalOpen(false)
    }
  }, [isAuthenticated])

  const handleAddTransaction = () => {
    if (isAuthenticated) {
      setIsModalOpen(true)
    } else {
      setAuthModalOpen(true)
    }
  }

  // Use Vite's BASE_URL which is automatically set from vite.config.ts base option
  // Remove trailing slash for React Router basename (React Router handles it)
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

  return (
    <Router basename={basename}>
      <AuthModalProvider
        open={() => setAuthModalOpen(true)}
        close={() => setAuthModalOpen(false)}
      >
        <DateFilterProvider>
          <div className="min-h-screen bg-gray-50">
            <Header
              onAddTransaction={handleAddTransaction}
              onSignInClick={() => setAuthModalOpen(true)}
            />
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
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recurring"
                  element={
                    <ProtectedRoute>
                      <RecurringTransactions />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <TransactionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
            />
          </div>
        </DateFilterProvider>
      </AuthModalProvider>
    </Router>
  )
}

export default App

