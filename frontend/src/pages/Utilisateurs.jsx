import { useState, useEffect } from 'react'
import api from '../services/api'
import { NotificationContainer } from '../components/Notification'
import { useNotification } from '../services/useNotification'
import ConfirmDialog from '../components/ConfirmDialog'

const couleurRole = {
  admin: 'bg-red-100 text-red-700',
  agent: 'bg-blue-100 text-blue-700',
  lecteur: 'bg-green-100 text-green-700',
}

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const { notifications, supprimer, succes, erreur } = useNotification()

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    mot_de_passe: '', role: 'lecteur'
  })

  useEffect(() => { chargerUtilisateurs() }, [])

  const chargerUtilisateurs = async () => {
    try {
      const rep = await api.get('/api/auth/utilisateurs')
      setUtilisateurs(rep.data)
    } catch (e) {
      erreur('Impossible de charger les utilisateurs.')
    } finally {
      setChargement(false)
    }
  }

  const handleCreer = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/auth/inscription', form)
      succes(`Utilisateur ${form.prenom} ${form.nom} créé avec succès.`)
      setForm({ nom:'', prenom:'', email:'', mot_de_passe:'', role:'lecteur' })
      setAfficherFormulaire(false)
      chargerUtilisateurs()
    } catch (e) {
      erreur(e.response?.data?.detail || 'Erreur lors de la création.')
    }
  }

  const demanderSuppression = (user) => {
    setConfirm({
      message: `Supprimer l'utilisateur ${user.prenom} ${user.nom} ?
        Cette action est irréversible.`,
      id: user.id,
      nom: `${user.prenom} ${user.nom}`
    })
  }

  const confirmerSuppression = async () => {
    try {
      await api.delete(`/api/auth/utilisateurs/${confirm.id}`)
      succes(`${confirm.nom} supprimé avec succès.`)
      chargerUtilisateurs()
    } catch (e) {
      erreur('Erreur lors de la suppression.')
    } finally {
      setConfirm(null)
    }
  }

  if (chargement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      <NotificationContainer
        notifications={notifications}
        supprimer={supprimer}
      />

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
            Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {utilisateurs.length} utilisateur(s)
          </p>
        </div>
        <button
          onClick={() => setAfficherFormulaire(!afficherFormulaire)}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg
            text-sm font-medium w-full sm:w-auto"
        >
          {afficherFormulaire ? 'Annuler' : '+ Nouvel utilisateur'}
        </button>
      </div>

      {/* Formulaire */}
      {afficherFormulaire && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">
            Créer un nouvel utilisateur
          </h2>
          <form onSubmit={handleCreer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nom', key: 'nom', type: 'text',
                placeholder: 'Ex: Dupont' },
              { label: 'Prénom', key: 'prenom', type: 'text',
                placeholder: 'Ex: Jean' },
              { label: 'Email', key: 'email', type: 'email',
                placeholder: 'jean@siga.cm' },
              { label: 'Mot de passe', key: 'mot_de_passe',
                type: 'password', placeholder: 'Minimum 8 caractères' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium
                  text-gray-700 mb-1">
                  {label} *
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({...form, [key]: e.target.value})}
                  required
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-300
                    rounded-lg text-sm focus:outline-none
                    focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300
                  rounded-lg text-sm focus:outline-none
                  focus:ring-2 focus:ring-blue-500"
              >
                <option value="lecteur">Lecteur</option>
                <option value="agent">Agent</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full py-2 bg-blue-900 text-white
                  font-semibold rounded-lg text-sm hover:bg-blue-800">
                Créer l'utilisateur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau desktop */}
      <div className="hidden md:block bg-white rounded-xl
        shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="text-left px-4 py-3">Nom complet</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Rôle</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Actions</th>
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
                  <span className={`px-2 py-0.5 rounded-full text-xs
                    font-medium ${couleurRole[user.role] || 'bg-gray-100'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs
                    font-medium ${user.est_actif
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'}`}>
                    {user.est_actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => demanderSuppression(user)}
                    className="px-3 py-1 bg-red-100 text-red-700
                      rounded hover:bg-red-200 text-xs font-medium"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartes mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {utilisateurs.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-blue-900 text-sm">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs
                font-medium ${couleurRole[user.role] || 'bg-gray-100'}`}>
                {user.role}
              </span>
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className={`px-2 py-0.5 rounded-full text-xs
                font-medium ${user.est_actif
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'}`}>
                {user.est_actif ? 'Actif' : 'Inactif'}
              </span>
              <button
                onClick={() => demanderSuppression(user)}
                className="px-3 py-1.5 bg-red-100 text-red-700
                  rounded text-xs font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Utilisateurs