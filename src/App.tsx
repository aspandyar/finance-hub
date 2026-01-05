import { useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Dashboard from './components/Dashboard/Dashboard'
import ChartsSection from './components/Charts/ChartsSection'
import TransactionModal from './components/TransactionModal/TransactionModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header onAddTransaction={() => setIsModalOpen(true)} />
        <main>
          <Dashboard />
          <ChartsSection />
        </main>
        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </ProtectedRoute>
  )
}

export default App

