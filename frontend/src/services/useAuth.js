import { useContext } from 'react'
import { AuthContext } from './AuthContext'

// Hook personnalisé pour accéder au contexte auth
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}