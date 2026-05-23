import { useState, useRef } from 'react'
import { uploaderDocument } from '../services/api'
import { useNotification } from '../services/useNotification'

const OCRUpload = () => {
  const { montrerNotification } = useNotification()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  const [mode, setMode] = useState('choix') // 'choix' | 'camera' | 'upload' | 'preview' | 'formulaire'
  const [fichier, setFichier] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [photoCapturee, setPhotoCapturee] = useState(null)
  
  // État OCR
  const [resultatOCR, setResultatOCR] = useState(null)
  const [chargementOCR, setChargementOCR] = useState(false)
  const [erreurOCR, setErreurOCR] = useState('')
  
  // État formulaire
  const [titre, setTitre] = useState('')
  const [confidentialite, setConfidentialite] = useState('')
  const [texteExtrait, setTexteExtrait] = useState('')
  const [chargementArchivage, setChargementArchivage] = useState(false)

  // Démarrer la caméra
  const demarrerCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        setMode('camera')
        montrerNotification('Caméra activée. Positionnez le document.', 'succes')
      }
    } catch (err) {
      montrerNotification(
        'Impossible d\'accéder à la caméra. Vérifiez les permissions.',
        'erreur'
      )
    }
  }

  // Arrêter la caméra
  const arreterCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setCameraActive(false)
    setPhotoCapturee(null)
    setMode('choix')
  }

  // Capturer une photo
  const capturerPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    canvasRef.current.toBlob((blob) => {
      const fichierPhoto = new File([blob], 'photo_document.jpg', { type: 'image/jpeg' })
      setFichier(fichierPhoto)
      setPhotoCapturee(canvasRef.current.toDataURL('image/jpeg'))
      setMode('preview')
      montrerNotification('Photo capturée. Prêt pour l\'OCR.', 'succes')
    }, 'image/jpeg', 0.95)
  }

  // Reprendre une photo
  const reprendrePhoto = () => {
    setPhotoCapturee(null)
    setMode('camera')
  }

  // Gérer l'upload d'image
  const gererUploadImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFichier(file)
      setMode('upload')
      montrerNotification('Image uploadée. Remplissez le formulaire.', 'succes')
    }
  }

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
        montrerNotification('OCR échoué. Remplissez manuellement.', 'avertissement')
        return
      }

      // OCR réussi
      setResultatOCR(data)
      setTitre(data.titre_suggere)
      setConfidentialite(data.confidentialite_suggeree)
      setTexteExtrait(data.texte)
      montrerNotification('OCR réussi ! Vérifiez les suggestions', 'succes')
      
      if (cameraActive) {
        arreterCamera()
      }

    } catch (err) {
      setErreurOCR(err.message)
      montrerNotification('Erreur OCR', 'erreur')
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
      montrerNotification('Sélectionnez une image', 'erreur')
      return
    }

    setChargementArchivage(true)

    try {
      const formData = new FormData()
      formData.append('titre', titre)
      formData.append('fichier', fichier)
      formData.append('niveau_confidentialite', confidentialite)

      await uploaderDocument(formData)

      montrerNotification(`Document "${titre}" archivé !`, 'succes')

      // Réinitialiser
      setFichier(null)
      setTitre('')
      setConfidentialite('')
      setTexteExtrait('')
      setResultatOCR(null)
      setPhotoCapturee(null)
      setMode('choix')

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

      {/* MODE CHOIX : Sélectionner la source */}
      {mode === 'choix' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          
          {/* Bouton Caméra */}
          <button
            onClick={demarrerCamera}
            className="bg-white rounded-xl shadow p-8 text-center hover:shadow-lg
              hover:border-blue-500 border-2 border-transparent transition"
          >
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Utiliser la caméra
            </h3>
            <p className="text-sm text-gray-500">
              Prenez une photo du document avec votre appareil
            </p>
          </button>

          {/* Bouton Upload */}
          <label
            className="bg-white rounded-xl shadow p-8 text-center hover:shadow-lg
              hover:border-blue-500 border-2 border-transparent transition cursor-pointer"
          >
            <div className="text-4xl mb-3">📁</div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Uploader une image
            </h3>
            <p className="text-sm text-gray-500">
              Sélectionnez une image depuis votre ordinateur
            </p>
            
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={gererUploadImage}
              className="hidden"
            />
          </label>

        </div>
      )}

      {/* MODE CAMERA : Flux vidéo en direct */}
      {mode === 'camera' && (
        <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
          
          <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '500px' }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>

          <div className="text-center text-sm text-gray-500 mb-4">
            📄 Positionnez le document dans le cadre
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={capturerPhoto}
              className="px-6 py-2.5 bg-green-600 text-white font-semibold
                rounded-lg hover:bg-green-700 transition"
            >
              📸 Capturer une photo
            </button>
            <button
              onClick={arreterCamera}
              className="px-6 py-2.5 bg-gray-400 text-white font-semibold
                rounded-lg hover:bg-gray-500 transition"
            >
              ✕ Fermer la caméra
            </button>
          </div>
        </div>
      )}

      {/* MODE PREVIEW : Aperçu de la photo caméra */}
      {mode === 'preview' && photoCapturee && (
        <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
          
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={photoCapturee}
              alt="Photo capturée"
              className="w-full h-auto"
            />
          </div>

          <div className="text-sm text-gray-500 mb-4 text-center">
            Vérifiez que la photo est claire et lisible
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={lancerOCR}
              disabled={chargementOCR}
              className="px-6 py-2.5 bg-blue-900 text-white font-semibold
                rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
            >
              {chargementOCR ? '⏳ OCR en cours...' : '🚀 Lancer l\'OCR'}
            </button>
            <button
              onClick={reprendrePhoto}
              className="px-6 py-2.5 bg-gray-400 text-white font-semibold
                rounded-lg hover:bg-gray-500 transition"
            >
              🔄 Reprendre une photo
            </button>
          </div>
        </div>
      )}

      {/* MODE UPLOAD : Formulaire pour image uploadée */}
      {mode === 'upload' && fichier && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">

          {/* Formulaire */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-blue-900 mb-4">
              Informations du document
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); lancerOCR(); }} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Facture 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau de confidentialité
                </label>
                <select
                  value={confidentialite}
                  onChange={(e) => setConfidentialite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Laisser l'IA décider</option>
                  <option value="public">Public</option>
                  <option value="interne">Interne</option>
                  <option value="confidentiel">Confidentiel</option>
                  <option value="secret">Secret</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={chargementOCR}
                className="w-full py-2.5 bg-blue-900 text-white font-semibold
                  rounded-lg hover:bg-blue-800 disabled:opacity-50 text-sm transition"
              >
                {chargementOCR ? '⏳ OCR en cours...' : '🚀 Lancer l\'OCR'}
              </button>

            </form>
          </div>

          {/* Résultats OCR */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-blue-900 mb-4">
              Résultats de l'OCR
            </h2>

            {!resultatOCR && !chargementOCR && (
              <div className="text-center text-gray-400 py-12">
                <p className="text-sm">
                  Les résultats apparaîtront ici après l'OCR
                </p>
              </div>
            )}

            {chargementOCR && (
              <div className="text-center text-blue-600 py-12">
                <p className="text-sm">⏳ Analyse en cours...</p>
              </div>
            )}

            {resultatOCR && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="font-medium">OCR réussi</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Titre</span>
                    <span className="font-medium text-gray-800">{resultatOCR.titre_suggere}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Confidentialité</span>
                    <span className="font-medium text-gray-800">{resultatOCR.confidentialite_suggeree}</span>
                  </div>
                </div>

                {texteExtrait && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Texte extrait
                    </p>
                    <p className="text-xs text-blue-700 line-clamp-3">
                      {texteExtrait}
                    </p>
                  </div>
                )}
              </div>
            )}

            {erreurOCR && (
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm text-orange-700">
                  ⚠️ {erreurOCR}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODE FORMULAIRE : Édition finale et archivage */}
      {mode === 'upload' && resultatOCR && (
        <div className="bg-white rounded-xl shadow p-6 mt-6 max-w-2xl">
          <h2 className="font-semibold text-blue-900 mb-4">
            Finaliser l'archivage
          </h2>

          <form onSubmit={archiver} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du document *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Suggéré par OCR
              </p>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                💡 Suggéré ({resultatOCR.confidentialite_suggeree})
              </p>
            </div>

            {texteExtrait && (
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
              </div>
            )}

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
      )}

    </div>
  )
}

export default OCRUpload