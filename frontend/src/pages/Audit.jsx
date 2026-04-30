import { useState, useEffect } from 'react'
import { obtenirLogs } from '../services/api'

// Couleurs des badges d'action
const couleurAction = {
  connexion: 'bg-green-100 text-green-700',
  upload: 'bg-blue-100 text-blue-700',
  telechargement: 'bg-purple-100 text-purple-700',
  suppression: 'bg-red-100 text-red-700',
  echec_connexion: 'bg-orange-100 text-orange-700',
  inscription: 'bg-gray-100 text-gray-700',
}

const Audit = () => {
  const [logs, setLogs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [filtreAction, setFiltreAction] = useState('')

  // Charge les logs au montage
  useEffect(() => {
    chargerLogs()
    // Actualisation toutes les 30 secondes
    const intervalle = setInterval(chargerLogs, 30000)
    return () => clearInterval(intervalle)
  }, [])

  const chargerLogs = async () => {
    try {
      const data = await obtenirLogs()
      setLogs(data.logs || [])
    } catch (err) {
      console.error('Erreur chargement logs:', err)
    } finally {
      setChargement(false)
    }
  }

  // Filtre les logs selon l'action sélectionnée
  const logsFiltres = filtreAction
    ? logs.filter((l) => l.action === filtreAction)
    : logs

  if (chargement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement du journal...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-900">
              Journal d'Audit
            </h1>
            <span className="px-2 py-0.5 bg-red-100 text-red-700
              text-xs font-medium rounded-full">
              Accès Administrateur
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {logsFiltres.length} action(s) enregistrée(s)
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 items-center">
          <select
            value={filtreAction}
            onChange={(e) => setFiltreAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg
              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les actions</option>
            <option value="connexion">Connexion</option>
            <option value="upload">Upload</option>
            <option value="telechargement">Téléchargement</option>
            <option value="suppression">Suppression</option>
            <option value="echec_connexion">Échec connexion</option>
          </select>
          <button
            onClick={chargerLogs}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg
              text-sm hover:bg-blue-800"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="text-left px-4 py-3">Date / Heure</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Utilisateur</th>
              <th className="text-left px-4 py-3">Document</th>
              <th className="text-left px-4 py-3">Adresse IP</th>
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
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.date_action).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${couleurAction[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {log.utilisateur_id || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {log.document_id || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {log.adresse_ip || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {log.details || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Audit