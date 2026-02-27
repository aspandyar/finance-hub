import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

interface AuthPageProps {
  /** When true, renders only the card content without full-screen wrapper (e.g. for modal) */
  embedded?: boolean
}

export default function AuthPage({ embedded }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)

  const content = (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-card p-8 shadow-card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Finance Hub</h1>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {content}
    </div>
  )
}

