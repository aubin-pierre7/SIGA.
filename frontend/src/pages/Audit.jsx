import { useState, useEffect } from 'react'
import { obtenirLogs } from '../services/api'

const couleurAction = {
  connexion: 'bg-green-100 text-green-700',
  upload: 'bg-blue-100 text-blue-700',
  telechargement: 'bg-purple-100 text-purple-700',
  suppression: 'bg-red-100 text-red-700',
  echec_connexion: 'bg-orange-100 text-orange-700',
  inscription: 'bg-gray-100 text-gray-700',
  suppression_utilisateur: 'bg-red-100 text-red-700',
}

const Audit = () => {
  const [logs, setLogs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [filtreAction, setFiltreAction] = useState('')

  useEffect(() => {
    chargerLogs()
    const intervalle = setInterval(chargerLogs, 30000)
    return () => clearInterval(intervalle)
  }, [])

  const chargerLogs = async () => {
    try {
      const data = await obtenirLogs()
      setLogs(data.logs || [])
    } catch (err) {
      console.error('Erreur logs:', err)
    } finally {
      setChargement(false)
    }
  }

  const logsFiltres = filtreAction
    ? logs.filter((l) => l.action === filtreAction)
    : logs

  if (chargement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between
        sm:items-center gap-3 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
              Journal d'Audit
            </h1>
            <span className="px-2 py-0.5 bg-red-100 text-red-700
              text-xs font-medium rounded-full">
              Accès Administrateur
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {logsFiltres.length} action(s)
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filtreAction}
            onChange={(e) => setFiltreAction(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300
              rounded-lg text-sm focus:outline-none focus:ring-2
              focus:ring-blue-500"
          >
            <option value="">Toutes</option>
            <option value="connexion">Connexion</option>
            <option value="upload">Upload</option>
            <option value="telechargement">Téléchargement</option>
            <option value="suppression">Suppression</option>
            <option value="echec_connexion">Échec connexion</option>
            <option value="inscription">Inscription</option>
            <option value="suppression_utilisateur">Suppression utilisateur</option>
          </select>
          <button
            onClick={chargerLogs}
            className="px-3 py-2 bg-blue-900 text-white rounded-lg text-sm"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Vue tableau sur grand écran */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="text-left px-4 py-3">Date / Heure</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Utilisateur</th>
                <th className="text-left px-4 py-3">Document</th>
                <th className="text-left px-4 py-3">IP</th>
                <th className="text-left px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Aucun log trouvé.
                  </td>
                </tr>
              ) : (
                logsFiltres.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(log.date_action).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs
                        font-medium ${couleurAction[log.action]
                          || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {log.utilisateur_nom}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {log.document_titre}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {log.adresse_ip}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue cartes sur mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {logsFiltres.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-400">Aucun log trouvé.</p>
          </div>
        ) : (
          logsFiltres.map((log) => (
            <div key={log.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${couleurAction[log.action] || 'bg-gray-100 text-gray-600'}`}>
                  {log.action}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(log.date_action).toLocaleString('fr-FR')}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-medium text-gray-700">
                  👤 {log.utilisateur_nom}
                </p>
                <p className="text-gray-500">
                  📄 {log.document_titre}
                </p>
                <p className="text-gray-500">
                  🌐 {log.adresse_ip}
                </p>
                {log.details !== '—' && (
                  <p className="text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    ℹ️ {log.details}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default Audit