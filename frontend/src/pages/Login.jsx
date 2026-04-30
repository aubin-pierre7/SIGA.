import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/useAuth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [afficherMdp, setAfficherMdp] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const role = await login(email, motDePasse)
      if (role === 'lecteur') {
        navigate('/documents')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setErreur('Email ou mot de passe incorrect.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' }}>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-900">SIGA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Système Intégré de Gestion d'Archives
          </p>
          <div className="h-1 w-16 mx-auto mt-3 rounded"
            style={{ backgroundColor: '#c9a227' }} />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Champ email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@siga.cm"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Champ mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={afficherMdp ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setAfficherMdp(!afficherMdp)}
                className="absolute right-3 top-2 text-gray-400 text-xs"
              >
                {afficherMdp ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {/* Message erreur */}
          {erreur && (
            <p className="text-red-500 text-sm text-center">{erreur}</p>
          )}

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={chargement}
            className="w-full py-2.5 bg-blue-900 text-white font-semibold
              rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>

        </form>

        {/* Infos demo */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Demo : admin@siga.cm / Admin2024
        </p>

      </div>
    </div>
  )
}

export default Login