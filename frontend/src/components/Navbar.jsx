import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/useAuth'

// Couleurs des badges selon le rôle
const couleurRole = {
  admin: 'bg-red-100 text-red-700',
  agent: 'bg-blue-100 text-blue-700',
  lecteur: 'bg-green-100 text-green-700',
}

const Navbar = () => {
  const { utilisateur, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b-2 border-blue-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo SIGA */}
        <div>
          <span className="text-xl font-bold text-blue-900">SIGA</span>
          <p className="text-xs text-yellow-600 font-medium">
            Système Intégré de Gestion d'Archives
          </p>
        </div>

        {/* Liens de navigation */}
        <div className="flex gap-6 text-sm font-medium">
          <Link to="/dashboard" className="text-blue-900 hover:text-yellow-600">
            Dashboard
          </Link>
          <Link to="/documents" className="text-blue-900 hover:text-yellow-600">
            Documents
          </Link>
          {(role === 'admin' || role === 'agent') && (
            <Link to="/upload" className="text-blue-900 hover:text-yellow-600">
              Upload
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/audit" className="text-blue-900 hover:text-yellow-600">
              Audit
            </Link>
          )}
        </div>

        {/* Infos utilisateur */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-900">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${couleurRole[role] || 'bg-gray-100'}`}>
              {role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 bg-blue-900 text-white rounded hover:bg-blue-800"
          >
            Déconnexion
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar