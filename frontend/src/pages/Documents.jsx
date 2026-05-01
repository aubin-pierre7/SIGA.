import { useState, useEffect } from 'react'
import { useAuth } from '../services/useAuth'
import {
  listerDocuments,
  telechargerDocument,
  supprimerDocument
} from '../services/api'
import { useNavigate } from 'react-router-dom'
import { NotificationContainer } from '../components/Notification'
import { useNotification } from '../services/useNotification'
import ConfirmDialog from '../components/ConfirmDialog'

const couleurConf = {
  public: 'bg-green-100 text-green-700',
  interne: 'bg-blue-100 text-blue-700',
  confidentiel: 'bg-orange-100 text-orange-700',
  secret: 'bg-red-100 text-red-700',
}

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
  const { notifications, supprimer, succes, erreur } = useNotification()
  const [documents, setDocuments] = useState([])
  const [chargement, setChargement] = useState(true)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => { chargerDocuments() }, [])

  const chargerDocuments = async () => {
    try {
      setChargement(true)
      const data = await listerDocuments()
      setDocuments(data.documents || [])
    } catch (err) {
      erreur('Impossible de charger les documents.')
    } finally {
      setChargement(false)
    }
  }

  const handleTelecharger = async (doc) => {
    try {
      await telechargerDocument(doc.id, doc.nom_fichier_original)
      succes(`"${doc.titre}" téléchargé avec succès.`)
    } catch (e) {
      erreur('Erreur lors du téléchargement.')
    }
  }

  const demanderSuppression = (doc) => {
    setConfirm({
      message: `Voulez-vous supprimer "${doc.titre}" ? Cette action est irréversible.`,
      id: doc.id
    })
  }

  const confirmerSuppression = async () => {
    try {
      await supprimerDocument(confirm.id)
      succes('Document supprimé avec succès.')
      chargerDocuments()
    } catch (e) {
      erreur('Erreur lors de la suppression.')
    } finally {
      setConfirm(null)
    }
  }

  const formaterTaille = (octets) => {
    if (octets < 1024) return `${octets} o`
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
  }

  if (chargement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        supprimer={supprimer}
      />

      {/* Boîte de confirmation */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setConfirm(null)}
        />
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between
        sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
            {role === 'admin' ? 'Tous les Documents' : 'Mes Documents'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} document(s)
          </p>
        </div>
        {(role === 'admin' || role === 'agent') && (
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg
              text-sm font-medium w-full sm:w-auto"
          >
            + Nouveau document
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-400">Aucun document archivé.</p>
        </div>
      ) : (
        <>
          {/* Tableau desktop */}
          <div className="hidden md:block bg-white rounded-xl
            shadow overflow-hidden">
            <div className="overflow-x-auto">
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
                        <span className={`px-2 py-0.5 rounded-full text-xs
                          font-medium ${couleurType[doc.type_document]
                            || 'bg-gray-100 text-gray-600'}`}>
                          {doc.type_document || 'Non classifié'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs
                          font-medium ${couleurConf[doc.niveau_confidentialite]
                            || 'bg-gray-100'}`}>
                          {doc.niveau_confidentialite}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(doc.date_upload)
                          .toLocaleDateString('fr-FR')}
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
                        {role === 'admin' && (
                          <button
                            onClick={() => demanderSuppression(doc)}
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
          </div>

          {/* Cartes mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-blue-900 text-sm flex-1">
                    {doc.titre}
                  </p>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs
                    font-medium ${couleurConf[doc.niveau_confidentialite]
                      || 'bg-gray-100'}`}>
                    {doc.niveau_confidentialite}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs
                  text-gray-500 mb-3">
                  <span className={`px-2 py-0.5 rounded-full font-medium
                    ${couleurType[doc.type_document]
                      || 'bg-gray-100 text-gray-600'}`}>
                    {doc.type_document || 'Non classifié'}
                  </span>
                  <span>
                    {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                  </span>
                  <span>{formaterTaille(doc.taille_fichier)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTelecharger(doc)}
                    className="flex-1 py-1.5 bg-blue-100 text-blue-700
                      rounded text-xs font-medium"
                  >
                    Télécharger
                  </button>
                  {role === 'admin' && (
                    <button
                      onClick={() => demanderSuppression(doc)}
                      className="flex-1 py-1.5 bg-red-100 text-red-700
                        rounded text-xs font-medium"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Documents