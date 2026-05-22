import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploaderDocument } from '../services/api'
import { useNotification } from '../services/useNotification'

const OCRUpload = () => {
  const navigate = useNavigate()
  const { montrerNotification } = useNotification()
  
  const [fichier, setFichier] = useState(null)
  const [mode, setMode] = useState('ocr') // 'ocr' ou 'fallback'
  const [chargementOCR, setChargementOCR] = useState(false)
  
  // État OCR
  const [resultatOCR, setResultatOCR] = useState(null)
  const [erreurOCR, setErreurOCR] = useState('')
  
  // État formulaire (OCR ou fallback)
  const [titre, setTitre] = useState('')
  const [confidentialite, setConfidentialite] = useState('')
  const [texteExtrait, setTexteExtrait] = useState('')
  const [chargementArchivage, setChargementArchivage] = useState(false)

  // Lancer l'OCR
  const lancerOCR = async () => {
    if (!fichier) {
      montrerNotification('Sélectionnez une image d\'abord', 'erreur')
      return
    }

    setChargementOCR(true)
    setErreurOCR('')
    setResultatOCR(null)

    try {
      const formData = new FormData()
      formData.append('fichier', fichier)

      const response = await fetch('http://127.0.0.1:8000/api/ocr/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('siga_token')}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur OCR')
      }

      if (!data.succes) {
        setErreurOCR(data.erreur || 'OCR échoué')
        setMode('fallback')
        return
      }

      // OCR réussi
      setResultatOCR(data)
      setTitre(data.titre_suggere)
      setConfidentialite(data.confidentialite_suggeree)
      setTexteExtrait(data.texte)
      setMode('ocr')
      montrerNotification('OCR réussi ! Vérifiez les suggestions', 'succes')

    } catch (err) {
      setErreurOCR(err.message)
      setMode('fallback')
      montrerNotification('OCR échoué, passage en mode formulaire', 'avertissement')
    } finally {
      setChargementOCR(false)
    }
  }

  // Archiver le document
  const archiver = async (e) => {
    e.preventDefault()

    if (!titre.trim()) {
      montrerNotification('Le titre est obligatoire', 'erreur')
      return
    }

    if (!confidentialite) {
      montrerNotification('Choisissez un niveau de confidentialité', 'erreur')
      return
    }

    if (!fichier) {
      montrerNotification('Sélectionnez un fichier', 'erreur')
      return
    }

    setChargementArchivage(true)

    try {
      const formData = new FormData()
      formData.append('titre', titre)
      formData.append('fichier', fichier)
      formData.append('niveau_confidentialite', confidentialite)

      await uploaderDocument(formData)

      montrerNotification(`Document "${titre}" archivé avec succès !`, 'succes')

      // Réinitialiser
      setFichier(null)
      setTitre('')
      setConfidentialite('')
      setTexteExtrait('')
      setResultatOCR(null)
      setMode('ocr')

    } catch (err) {
      montrerNotification('Erreur lors de l\'archivage', 'erreur')
    } finally {
      setChargementArchivage(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          📸 Scanner & Archiver
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Scannez un document papier et SIGA l'archive automatiquement avec OCR
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Étape 1 : Upload */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-1">
          <h2 className="font-semibold text-blue-900 mb-4">
            1️⃣ Sélectionner l'image
          </h2>

          <div className="border-2 border-dashed border-blue-300 rounded-lg
            p-6 text-center cursor-pointer hover:border-blue-500 transition mb-4"
            onClick={() => document.getElementById('ocr-input').click()}>
            <p className="text-sm text-gray-500">
              {fichier ? `📄 ${fichier.name}` : '📸 Cliquez pour sélectionner'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, PDF (une page)
            </p>
            <input
              id="ocr-input"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => {
                setFichier(e.target.files[0])
                setResultatOCR(null)
                setErreurOCR('')
              }}
              className="hidden"
            />
          </div>

          {fichier && (
            <button
              onClick={lancerOCR}
              disabled={chargementOCR}
              className="w-full py-2.5 bg-blue-900 text-white font-semibold
                rounded-lg hover:bg-blue-800 disabled:opacity-50 text-sm transition"
            >
              {chargementOCR ? '⏳ OCR en cours...' : '🚀 Lancer l\'OCR'}
            </button>
          )}
        </div>

        {/* Étape 2 : Résultats OCR ou Formulaire */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="font-semibold text-blue-900 mb-4">
            {mode === 'ocr' ? '2️⃣ Résultats OCR' : '2️⃣ Formulaire manuel'}
          </h2>

          {erreurOCR && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-700">
                ⚠️ {erreurOCR}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Remplissez manuellement les champs ci-dessous
              </p>
            </div>
          )}

          <form onSubmit={archiver} className="space-y-4">

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du document *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder={resultatOCR ? resultatOCR.titre_suggere : "Ex: Facture 2024"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {mode === 'ocr' && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Suggéré par OCR. Modifiez si nécessaire.
                </p>
              )}
            </div>

            {/* Confidentialité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau de confidentialité *
              </label>
              <select
                value={confidentialite}
                onChange={(e) => setConfidentialite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un niveau</option>
                <option value="public">Public - Accessible à tous</option>
                <option value="interne">Interne - Accès restreint</option>
                <option value="confidentiel">Confidentiel - Données sensibles</option>
                <option value="secret">Secret - Très restreint</option>
              </select>
              {mode === 'ocr' && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Suggéré par OCR ({resultatOCR?.confidentialite_suggeree}). Modifiez si nécessaire.
                </p>
              )}
            </div>

            {/* Texte extrait (OCR seulement) */}
            {mode === 'ocr' && texteExtrait && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte extrait par OCR
                </label>
                <textarea
                  value={texteExtrait}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                    text-xs bg-gray-50 focus:outline-none h-32"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Aperçu du texte reconnu (lecture seule)
                </p>
              </div>
            )}

            {/* Bouton archiver */}
            <button
              type="submit"
              disabled={chargementArchivage}
              className="w-full py-2.5 bg-green-600 text-white font-semibold
                rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition"
            >
              {chargementArchivage ? '⏳ Archivage...' : '✅ Archiver ce document'}
            </button>

          </form>
        </div>

      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-sm text-blue-700">
          <strong>💡 Comment ça marche :</strong> Scannez le document papier avec votre téléphone,
          uploadez l'image, SIGA lit le texte automatiquement avec l'OCR, vous vérifiez les suggestions,
          et le document est chiffré et archivé en un clic.
        </p>
      </div>

    </div>
  )
}

export default OCRUpload