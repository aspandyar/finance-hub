import { X } from 'lucide-react'
import AuthPage from './AuthPage'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative bg-gray-50 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="p-4 pt-12">
          <AuthPage embedded />
        </div>
      </div>
    </div>
  )
}
