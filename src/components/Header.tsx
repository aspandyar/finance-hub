import { Plus, Bell, User } from 'lucide-react'

interface HeaderProps {
  onAddTransaction: () => void
}

export default function Header({ onAddTransaction }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Finance Hub</h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Add Transaction Button */}
            <button
              onClick={onAddTransaction}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus size={20} />
              <span>Add Transaction</span>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={18} className="text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

