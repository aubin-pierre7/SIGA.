import { useState, useEffect } from 'react'
import { useAuth } from '../services/useAuth'
import { listerDocuments, telechargerDocument, supprimerDocument } from '../services/api'
import { useNavigate } from 'react-router-dom'

// Couleurs des badges de confidentialité
const couleurConf = {
  public: 'bg-green-100 text-green-700',
  interne: 'bg-blue-100 text-blue-700',
  confidentiel: 'bg-orange-100 text-orange-700',
  secret: 'bg-red-100 text-red-700',
}

// Couleurs des badges de type document
const couleurType = {
  'Contrat': 'bg-purple-100 text-purple-700',
  'Rapport': 'bg-green-100 text-green-700',
  'Décision': 'bg-orange-100 text-orange-700',
  'Facture': 'bg-yellow-100 text-yellow-700',
  'Courrier': 'bg-blue-100 text-blue-700',
  'Procès-verbal': 'bg-red-100 text-red-700',
}

const Documents = () => {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  // Charge la liste des documents au montage
  useEffect(() => {
    chargerDocuments()
  }, [])

  const chargerDocuments = async () => {
    try {
      setChargement(true)
      const data = await listerDocuments()
      setDocuments(data.documents || [])
    } catch (err) {
      setErreur('Impossible de charger les documents.')
    } finally {
      setChargement(false)
    }
  }

  // Télécharge un document déchiffré
  const handleTelecharger = async (doc) => {
    try {
      await telechargerDocument(doc.id, doc.nom_fichier_original)
    } catch (err) {
      alert('Erreur lors du téléchargement.')
    }
  }

  // Supprime un document après confirmation
  const handleSupprimer = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce document ?')) return
    try {
      await supprimerDocument(id)
      chargerDocuments()
    } catch (err) {
      alert('Erreur lors de la suppression.')
    }
  }

  // Formate la taille du fichier
  const formaterTaille = (octets) => {
    if (octets < 1024) return `${octets} o`
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
  }

  if (chargement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement des documents...</p>
    </div>
  )

  if (erreur) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-red-500">{erreur}</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            {role === 'admin' ? 'Tous les Documents' : 'Mes Documents'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} document(s) trouvé(s)
          </p>
        </div>
        {(role === 'admin' || role === 'agent') && (
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg
              hover:bg-blue-800 text-sm font-medium"
          >
            + Nouveau document
          </button>
        )}
      </div>

      {/* Tableau */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-400 text-lg">Aucun document archivé.</p>
          {(role === 'admin' || role === 'agent') && (
            <button
              onClick={() => navigate('/upload')}
              className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm"
            >
              Uploader votre premier document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="text-left px-4 py-3">Titre</th>
                <th className="text-left px-4 py-3">Type IA</th>
                <th className="text-left px-4 py-3">Confidentialité</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Taille</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {doc.titre}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${couleurType[doc.type_document] || 'bg-gray-100 text-gray-600'}`}>
                      {doc.type_document || 'Non classifié'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${couleurConf[doc.niveau_confidentialite] || 'bg-gray-100'}`}>
                      {doc.niveau_confidentialite}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formaterTaille(doc.taille_fichier)}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleTelecharger(doc)}
                      className="px-3 py-1 bg-blue-100 text-blue-700
                        rounded hover:bg-blue-200 text-xs font-medium"
                    >
                      Télécharger
                    </button>
                    {(role === 'admin') && (
                      <button
                        onClick={() => handleSupprimer(doc.id)}
                        className="px-3 py-1 bg-red-100 text-red-700
                          rounded hover:bg-red-200 text-xs font-medium"
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Documents