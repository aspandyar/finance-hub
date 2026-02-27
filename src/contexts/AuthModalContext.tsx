import { createContext, useContext, ReactNode } from 'react'

interface AuthModalContextType {
  openAuthModal: () => void
  closeAuthModal: () => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}

interface AuthModalProviderProps {
  children: ReactNode
  open: () => void
  close: () => void
}

export function AuthModalProvider({ children, open, close }: AuthModalProviderProps) {
  const value = {
    openAuthModal: open,
    closeAuthModal: close,
  }
  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  )
}
