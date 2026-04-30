import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../services/useAuth'

// Protège les routes privées et vérifie les rôles
const ProtectedRoute = ({ rolesAutorises }) => {
  const { estConnecte, role } = useAuth()

  // Vérifie connexion depuis contexte ou localStorage
  const connecte = estConnecte || !!localStorage.getItem('siga_token')
  const roleEffectif = role || localStorage.getItem('siga_role')

  if (!connecte) {
    return <Navigate to="/login" replace />
  }

  if (rolesAutorises && !rolesAutorises.includes(roleEffectif)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-4">
            Votre rôle <strong>({roleEffectif})</strong> ne permet pas
            d'accéder à cette page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default ProtectedRoute