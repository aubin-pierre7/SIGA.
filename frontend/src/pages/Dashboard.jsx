import { useState, useEffect } from 'react'
import { useAuth } from '../services/useAuth'
import { obtenirStatistiques, obtenirMesActivites } from '../services/api'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { utilisateur, role } = useAuth()
  const [stats, setStats] = useState(null)
  const [activites, setActivites] = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

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

  if (chargement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
          Tableau de bord
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue, {utilisateur?.prenom} {utilisateur?.nom} -{' '}
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Dashboard Admin */}
      {role === 'admin' && stats && (
        <>
          {/* Cartes statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <CarteStats
              titre="Documents"
              valeur={stats.total_documents}
              couleur="bg-blue-900"
              onClick={() => navigate('/documents')}
            />
            <CarteStats
              titre="Utilisateurs"
              valeur={stats.total_utilisateurs}
              couleur="bg-green-700"
              onClick={() => navigate('/utilisateurs')}
            />
            <CarteStats
              titre="Actions aujourd'hui"
              valeur={stats.actions_aujourd_hui}
              couleur="bg-orange-600"
              onClick={() => navigate('/audit')}
            />
            <CarteStats
              titre="Uploads aujourd'hui"
              valeur={stats.uploads_aujourd_hui}
              couleur="bg-purple-700"
              onClick={() => navigate('/upload')}
            />
          </div>

          {/* Accès rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <CarteAction
              titre="Archiver un document"
              description="Uploadez un nouveau document. Il sera chiffré et analysé automatiquement par l'IA."
              bouton="Uploader"
              onClick={() => navigate('/upload')}
              couleurBouton="bg-blue-900"
            />
            <CarteAction
              titre="Journal d'audit"
              description="Consultez toutes les actions effectuées sur la plateforme en temps réel."
              bouton="Voir les logs"
              onClick={() => navigate('/audit')}
              couleurBouton="bg-orange-600"
            />
            <CarteAction
              titre="Gestion des utilisateurs"
              description="Ajoutez, consultez ou supprimez des utilisateurs et gérez leurs rôles."
              bouton="Gérer"
              onClick={() => navigate('/utilisateurs')}
              couleurBouton="bg-green-700"
            />
          </div>

          {/* Section informations SIGA */}
          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              À propos de SIGA
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              SIGA est un système d'archivage numérique sécurisé conçu pour
              les administrations. Chaque document uploadé est automatiquement
              chiffré avec l'algorithme AES-256-GCM, analysé par des modules
              d'intelligence artificielle pour en extraire les métadonnées,
              et toutes les actions sont tracées dans un journal d'audit complet.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <InfoBadge label="Chiffrement" valeur="AES-256-GCM" />
              <InfoBadge label="Authentification" valeur="JWT Token" />
              <InfoBadge label="IA" valeur="spaCy + scikit-learn" />
            </div>
          </div>

          {/* Niveaux de confidentialité */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              Niveaux de confidentialité
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NiveauBadge
                niveau="Public"
                description="Accessible à tous"
                couleur="bg-green-100 text-green-800"
              />
              <NiveauBadge
                niveau="Interne"
                description="Usage interne uniquement"
                couleur="bg-blue-100 text-blue-800"
              />
              <NiveauBadge
                niveau="Confidentiel"
                description="Accès restreint"
                couleur="bg-orange-100 text-orange-800"
              />
              <NiveauBadge
                niveau="Secret"
                description="Accès très limité"
                couleur="bg-red-100 text-red-800"
              />
            </div>
          </div>
        </>
      )}

      {/* Dashboard Agent */}
      {role === 'agent' && (
        <>
          {/* Accès rapides agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <CarteAction
              titre="Archiver un document"
              description="Uploadez un nouveau document. Il sera chiffré et analysé automatiquement par l'IA."
              bouton="Uploader maintenant"
              onClick={() => navigate('/upload')}
              couleurBouton="bg-blue-900"
            />
            <CarteAction
              titre="Mes documents"
              description="Consultez et téléchargez les documents que vous avez archivés."
              bouton="Voir mes documents"
              onClick={() => navigate('/documents')}
              couleurBouton="bg-green-700"
            />
          </div>

          {/* Activités récentes */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Mes activités récentes
            </h2>
            {activites.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune activité récente.</p>
            ) : (
              <ul className="divide-y">
                {activites.slice(0, 5).map((log) => (
                  <li key={log.id}
                    className="py-3 flex flex-col sm:flex-row
                      sm:justify-between gap-1 text-sm">
                    <span className="font-medium text-gray-700">
                      {log.action}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm">
                      {new Date(log.date_action).toLocaleString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Info sécurité */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Vos documents sont sécurisés
            </h3>
            <p className="text-xs text-blue-700">
              Chaque fichier uploadé est chiffré avec AES-256-GCM avant
              d'être stocké. Seules les personnes autorisées peuvent
              y accéder.
            </p>
          </div>
        </>
      )}

      {/* Dashboard Lecteur */}
      {role === 'lecteur' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
            <CarteAction
              titre="Consulter les documents"
              description="Accédez aux documents archivés auxquels vous avez accès et téléchargez-les."
              bouton="Voir les documents"
              onClick={() => navigate('/documents')}
              couleurBouton="bg-blue-900"
            />
          </div>

          {/* Activités récentes */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Mes activités récentes
            </h2>
            {activites.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune activité récente.</p>
            ) : (
              <ul className="divide-y">
                {activites.slice(0, 5).map((log) => (
                  <li key={log.id}
                    className="py-3 flex flex-col sm:flex-row
                      sm:justify-between gap-1 text-sm">
                    <span className="font-medium text-gray-700">
                      {log.action}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm">
                      {new Date(log.date_action).toLocaleString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Info rôle */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Votre rôle : Lecteur
            </h3>
            <p className="text-xs text-gray-500">
              En tant que lecteur, vous pouvez consulter et télécharger
              les documents disponibles. Pour uploader des documents,
              contactez un administrateur pour modifier vos permissions.
            </p>
          </div>
        </>
      )}

    </div>
  )
}

const CarteStats = ({ titre, valeur, couleur, onClick }) => (
  <div
    onClick={onClick}
    className={`${couleur} text-white rounded-xl p-4 sm:p-5 shadow
      cursor-pointer hover:opacity-90 transition`}
  >
    <p className="text-xs sm:text-sm opacity-80">{titre}</p>
    <p className="text-2xl sm:text-3xl font-bold mt-1">{valeur ?? '—'}</p>
    <p className="text-xs opacity-60 mt-2">Cliquer pour voir →</p>
  </div>
)

const CarteAction = ({ titre, description, bouton, onClick, couleurBouton }) => (
  <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between">
    <div>
      <h3 className="font-semibold text-blue-900 mb-2">{titre}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
    <button
      onClick={onClick}
      className={`mt-4 px-4 py-2 ${couleurBouton} text-white rounded-lg
        text-sm font-medium hover:opacity-90 transition w-full sm:w-auto`}
    >
      {bouton}
    </button>
  </div>
)

const InfoBadge = ({ label, valeur }) => (
  <div className="bg-gray-50 rounded-lg p-3 text-center">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-blue-900 mt-1">{valeur}</p>
  </div>
)

const NiveauBadge = ({ niveau, description, couleur }) => (
  <div className={`${couleur} rounded-lg p-3 text-center`}>
    <p className="text-sm font-semibold">{niveau}</p>
    <p className="text-xs mt-1 opacity-75">{description}</p>
  </div>
)

export default Dashboard