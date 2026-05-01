import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/useAuth'

const couleurRole = {
  admin: 'bg-red-100 text-red-700',
  agent: 'bg-blue-100 text-blue-700',
  lecteur: 'bg-green-100 text-green-700',
}

const Navbar = () => {
  const { utilisateur, role, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOuvert, setMenuOuvert] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b-2 border-blue-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">

        {/* Ligne principale */}
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div>
            <span className="text-xl font-bold text-blue-900">SIGA</span>
            <p className="text-xs text-yellow-600 font-medium hidden sm:block">
              Système Intégré de Gestion d'Archives
            </p>
          </div>

          {/* Liens desktop (cachés sur mobile) */}
          <div className="hidden md:flex gap-6 text-sm font-medium">
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
              <>
                <Link to="/audit" className="text-blue-900 hover:text-yellow-600">
                  Audit
                </Link>
                <Link to="/utilisateurs" className="text-blue-900 hover:text-yellow-600">
                  Utilisateurs
                </Link>
              </>
            )}
          </div>

          {/* Infos utilisateur desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-900">
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${couleurRole[role] || 'bg-gray-100'}`}>
                {role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 bg-blue-900 text-white
                rounded hover:bg-blue-800"
            >
              Déconnexion
            </button>
          </div>

          {/* Bouton menu hamburger (visible sur mobile) */}
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="md:hidden p-2 text-blue-900"
          >
            <div className="w-5 h-0.5 bg-blue-900 mb-1"></div>
            <div className="w-5 h-0.5 bg-blue-900 mb-1"></div>
            <div className="w-5 h-0.5 bg-blue-900"></div>
          </button>

        </div>

        {/* Menu mobile (visible quand ouvert) */}
        {menuOuvert && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-200 pt-3
            flex flex-col gap-3">

            {/* Infos utilisateur */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {utilisateur?.prenom} {utilisateur?.nom}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${couleurRole[role] || 'bg-gray-100'}`}>
                  {role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 bg-blue-900 text-white rounded"
              >
                Déconnexion
              </button>
            </div>

            {/* Liens mobile */}
            <div className="flex flex-col gap-2 text-sm font-medium">
              <Link
                to="/dashboard"
                onClick={() => setMenuOuvert(false)}
                className="text-blue-900 py-1"
              >
                Dashboard
              </Link>
              <Link
                to="/documents"
                onClick={() => setMenuOuvert(false)}
                className="text-blue-900 py-1"
              >
                Documents
              </Link>
              {(role === 'admin' || role === 'agent') && (
                <Link
                  to="/upload"
                  onClick={() => setMenuOuvert(false)}
                  className="text-blue-900 py-1"
                >
                  Upload
                </Link>
              )}
              {role === 'admin' && (
                <>
                  <Link
                    to="/audit"
                    onClick={() => setMenuOuvert(false)}
                    className="text-blue-900 py-1"
                  >
                    Audit
                  </Link>
                  <Link
                    to="/utilisateurs"
                    onClick={() => setMenuOuvert(false)}
                    className="text-blue-900 py-1"
                  >
                    Utilisateurs
                  </Link>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </nav>
  )
}

export default Navbar