import { useState, useEffect } from 'react'
import api from '../services/api'

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  // Données du formulaire de création
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    role: 'lecteur'
  })

  // Charge la liste des utilisateurs au montage
  useEffect(() => {
    chargerUtilisateurs()
  }, [])

  const chargerUtilisateurs = async () => {
    try {
      const rep = await api.get('/api/auth/utilisateurs')
      setUtilisateurs(rep.data)
    } catch (err) {
      setErreur('Impossible de charger les utilisateurs.')
    } finally {
      setChargement(false)
    }
  }

  // Soumet le formulaire de création
  const handleCreer = async (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    try {
      await api.post('/api/auth/inscription', form)
      setSucces(`Utilisateur ${form.prenom} ${form.nom} créé avec succès.`)
      setForm({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'lecteur' })
      setAfficherFormulaire(false)
      chargerUtilisateurs()
    } catch (err) {
      const msg = err.response?.data?.detail
      setErreur(msg || 'Erreur lors de la création.')
    }
  }

  // Couleurs des badges de rôle
  const couleurRole = {
    admin: 'bg-red-100 text-red-700',
    agent: 'bg-blue-100 text-blue-700',
    lecteur: 'bg-green-100 text-green-700',
  }

  if (chargement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement des utilisateurs...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {utilisateurs.length} utilisateur(s) enregistré(s)
          </p>
        </div>
        <button
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg
            hover:bg-blue-800 text-sm font-medium"
        >
          {afficherFormulaire ? 'Annuler' : '+ Nouvel utilisateur'}
        </button>
      </div>

      {/* Messages */}
      {succes && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200
          text-green-700 rounded-lg text-sm">
          {succes}
        </div>
      )}
      {erreur && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200
          text-red-700 rounded-lg text-sm">
          {erreur}
        </div>
      )}

      {/* Formulaire de création */}
      {afficherFormulaire && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">
            Créer un nouvel utilisateur
          </h2>
          <form onSubmit={handleCreer} className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({...form, nom: e.target.value})}
                required
                placeholder="Ex: Dupont"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({...form, prenom: e.target.value})}
                required
                placeholder="Ex: Jean"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
                placeholder="jean.dupont@siga.cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                value={form.mot_de_passe}
                onChange={(e) => setForm({...form, mot_de_passe: e.target.value})}
                required
                placeholder="Minimum 8 caractères"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lecteur">Lecteur</option>
                <option value="agent">Agent</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-blue-900 text-white font-semibold
                  rounded-lg hover:bg-blue-800 text-sm"
              >
                Créer l'utilisateur
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="text-left px-4 py-3">Nom complet</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Rôle</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Date création</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {utilisateurs.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {user.prenom} {user.nom}
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${couleurRole[user.role] || 'bg-gray-100'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${user.est_actif
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'}`}>
                    {user.est_actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Utilisateurs