import { useState, useEffect } from 'react'
import { useAuth } from '../services/useAuth'
import { obtenirStatistiques, obtenirMesActivites } from '../services/api'

const Dashboard = () => {
  const { utilisateur, role } = useAuth()
  const [stats, setStats] = useState(null)
  const [activites, setActivites] = useState([])
  const [chargement, setChargement] = useState(true)

  // Charge les données selon le rôle
  useEffect(() => {
    const charger = async () => {
      try {
        if (role === 'admin') {
          const data = await obtenirStatistiques()
          setStats(data)
        } else {
          const data = await obtenirMesActivites()
          setActivites(data.logs || [])
        }
      } catch (err) {
        console.error('Erreur dashboard:', err)
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [role])

  if (chargement) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900">
          Tableau de bord
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue, {utilisateur?.prenom} {utilisateur?.nom}
        </p>
      </div>

      {/* Dashboard Admin */}
      {role === 'admin' && stats && (
        <>
          {/* Cartes statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
            <CarteStats
              titre="Documents"
              valeur={stats.total_documents}
              couleur="bg-blue-900"
            />
            <CarteStats
              titre="Utilisateurs"
              valeur={stats.total_utilisateurs}
              couleur="bg-green-700"
            />
            <CarteStats
              titre="Actions aujourd'hui"
              valeur={stats.actions_aujourd_hui}
              couleur="bg-orange-600"
            />
            <CarteStats
              titre="Uploads aujourd'hui"
              valeur={stats.uploads_aujourd_hui}
              couleur="bg-purple-700"
            />
          </div>
        </>
      )}

      {/* Dashboard Agent/Lecteur */}
      {role !== 'admin' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Mes activités récentes
          </h2>
          {activites.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune activité récente.</p>
          ) : (
            <ul className="divide-y">
              {activites.slice(0, 5).map((log) => (
                <li key={log.id} className="py-3 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{log.action}</span>
                  <span className="text-gray-400">
                    {new Date(log.date_action).toLocaleString('fr-FR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  )
}

// Composant carte statistique
const CarteStats = ({ titre, valeur, couleur }) => (
  <div className={`${couleur} text-white rounded-xl p-5 shadow`}>
    <p className="text-sm opacity-80">{titre}</p>
    <p className="text-3xl font-bold mt-1">{valeur ?? '—'}</p>
  </div>
)

export default Dashboard