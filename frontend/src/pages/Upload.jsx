import { useState } from 'react'
import { uploaderDocument } from '../services/api'
import { useNotification } from '../services/useNotification'

const Upload = () => {
  const [titre, setTitre] = useState('')
  const [fichier, setFichier] = useState(null)
  const [confidentialite, setConfidentialite] = useState('')
  const [chargement, setChargement] = useState(false)
  const [resultat, setResultat] = useState(null)
  const { montrerNotification } = useNotification()

  // Soumet le formulaire d'upload
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!fichier) {
      montrerNotification('Veuillez sélectionner un fichier.', 'erreur')
      return
    }
    
    if (!confidentialite) {
      montrerNotification('Veuillez choisir un niveau de confidentialité.', 'erreur')
      return
    }
    
    setChargement(true)
    setResultat(null)
    
    try {
      const formData = new FormData()
      formData.append('titre', titre)
      formData.append('fichier', fichier)
      formData.append('niveau_confidentialite', confidentialite)
      
      const data = await uploaderDocument(formData)
      
      setResultat(data)
      montrerNotification(`Document "${titre}" archivé avec succès !`, 'succes')
      
      // Réinitialiser le formulaire
      setTitre('')
      setFichier(null)
      setConfidentialite('')
    } catch (err) {
      montrerNotification('Erreur lors de l\'archivage du document.', 'erreur')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Archiver un document
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Le document sera chiffré en AES-256-GCM et stocké de manière sécurisée
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-blue-900 mb-4">
            Informations du document
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                placeholder="Ex: Contrat de prestation 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau de confidentialité *
              </label>
              <select
                value={confidentialite}
                onChange={(e) => setConfidentialite(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un niveau</option>
                <option value="public">Public - Accessible à tous</option>
                <option value="interne">Interne - Accès restreint</option>
                <option value="confidentiel">Confidentiel - Données sensibles</option>
                <option value="secret">Secret - Très restreint</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier *
              </label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg
                p-6 text-center cursor-pointer hover:border-blue-500 transition"
                onClick={() => document.getElementById('fichier-input').click()}>
                <p className="text-sm text-gray-500">
                  {fichier ? `📄 ${fichier.name}` : '📁 Cliquez pour sélectionner un fichier'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, TXT, DOC, DOCX
                </p>
                <input
                  id="fichier-input"
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => setFichier(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={chargement}
              className="w-full py-2.5 bg-blue-900 text-white font-semibold
                rounded-lg hover:bg-blue-800 disabled:opacity-50 text-sm transition"
            >
              {chargement ? '⏳ Archivage en cours...' : '🔒 Archiver maintenant'}
            </button>

          </form>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-blue-900 mb-4">
            Résumé de l'archivage
          </h2>

          {!resultat && !chargement && (
            <div className="text-center text-gray-400 py-12">
              <p className="text-sm">
                Les détails apparaîtront ici après l'archivage
              </p>
            </div>
          )}

          {chargement && (
            <div className="text-center text-blue-600 py-12">
              <p className="text-sm">⏳ Chiffrement et archivage en cours...</p>
            </div>
          )}

          {resultat && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 font-bold text-lg">✓</span>
                <span className="font-medium text-green-700">Archivé avec succès</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <InfoLigne label="Titre" valeur={resultat.titre} />
                <InfoLigne label="Confidentialité" valeur={resultat.niveau_confidentialite} />
                <InfoLigne label="Taille" valeur={`${(resultat.taille_fichier / 1024).toFixed(1)} Ko`} />
                <InfoLigne
                  label="Hash SHA-256"
                  valeur={resultat.hash_sha256?.substring(0, 24) + '...'}
                />
                <p className="text-xs text-gray-500 mt-3 border-t pt-2">
                  Le hash SHA-256 permet de vérifier l'intégrité du document
                  à tout moment. Aucune modification ne passera inaperçue.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700">
                  🔐 Ce document est chiffré avec AES-256-GCM et ne peut être
                  consulté que par les personnes autorisées selon le niveau
                  de confidentialité que vous avez choisi.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// Composant ligne d'information
const InfoLigne = ({ label, valeur }) => (
  <div className="flex justify-between gap-2">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right">{valeur}</span>
  </div>
)

export default Upload