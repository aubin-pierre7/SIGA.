import { useState } from 'react'
import { uploaderDocument } from '../services/api'

const Upload = () => {
  const [titre, setTitre] = useState('')
  const [fichier, setFichier] = useState(null)
  const [confidentialite, setConfidentialite] = useState('')
  const [chargement, setChargement] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [erreur, setErreur] = useState('')

  // Soumet le formulaire d'upload
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fichier) { setErreur('Veuillez sélectionner un fichier.'); return }
    setChargement(true)
    setErreur('')
    setResultat(null)
    try {
      const formData = new FormData()
      formData.append('titre', titre)
      formData.append('fichier', fichier)
      if (confidentialite) {
        formData.append('niveau_confidentialite', confidentialite)
      }
      const data = await uploaderDocument(formData)
      setResultat(data)
      setTitre('')
      setFichier(null)
      setConfidentialite('')
    } catch (err) {
      setErreur('Erreur lors de l\'upload. Vérifiez le fichier.')
    } finally {
      setChargement(false)
    }
  }

  // Parse les métadonnées IA depuis le JSON
  const parseMetadonnees = (metaStr) => {
    try { return JSON.parse(metaStr) } catch { return null }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Archiver un document
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Le document sera chiffré et analysé automatiquement par l'IA
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier *
              </label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg
                p-6 text-center cursor-pointer hover:border-blue-500"
                onClick={() => document.getElementById('fichier-input').click()}>
                <p className="text-sm text-gray-500">
                  {fichier ? fichier.name : 'Cliquez pour sélectionner un fichier'}
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

            {erreur && (
              <p className="text-red-500 text-sm">{erreur}</p>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full py-2.5 bg-blue-900 text-white font-semibold
                rounded-lg hover:bg-blue-800 disabled:opacity-50 text-sm"
            >
              {chargement ? 'Analyse en cours...' : 'Analyser et archiver'}
            </button>

          </form>
        </div>

        {/* Résultats IA */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-blue-900 mb-4">
            Résultats de l'analyse IA
          </h2>

          {!resultat && !chargement && (
            <div className="text-center text-gray-400 py-12">
              <p className="text-sm">
                Les résultats apparaîtront ici après l'upload
              </p>
            </div>
          )}

          {chargement && (
            <div className="text-center text-blue-600 py-12">
              <p className="text-sm">Chiffrement et analyse en cours...</p>
            </div>
          )}

          {resultat && (() => {
            const meta = parseMetadonnees(resultat.metadonnees_ia)
            return (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="font-medium">Document archivé avec succès</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <InfoLigne label="Catégorie IA" valeur={resultat.type_document} />
                  <InfoLigne label="Confidentialité" valeur={resultat.niveau_confidentialite} />
                  <InfoLigne label="Taille" valeur={`${(resultat.taille_fichier / 1024).toFixed(1)} Ko`} />
                  <InfoLigne
                    label="Hash SHA-256"
                    valeur={resultat.hash_sha256?.substring(0, 20) + '...'}
                  />
                </div>

                {meta && (
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <p className="font-semibold text-blue-900">
                      Métadonnées extraites
                    </p>
                    {meta.objet && <InfoLigne label="Objet" valeur={meta.objet} />}
                    {meta.dates?.length > 0 && (
                      <InfoLigne label="Dates" valeur={meta.dates.join(', ')} />
                    )}
                    {meta.personnes?.length > 0 && (
                      <InfoLigne label="Personnes" valeur={meta.personnes.join(', ')} />
                    )}
                    {meta.organisations?.length > 0 && (
                      <InfoLigne label="Organisations" valeur={meta.organisations.join(', ')} />
                    )}
                  </div>
                )}
              </div>
            )
          })()}
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