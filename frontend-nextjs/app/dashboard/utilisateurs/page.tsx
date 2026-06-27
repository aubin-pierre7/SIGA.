// app/dashboard/utilisateurs/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usersAPI } from '@/lib/api'
import { Search, Plus, Edit2, Trash2, Shield, Eye, EyeOff } from 'lucide-react'

interface User {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'agent' | 'lecteur'
  is_active: boolean
  created_at: string
  department?: string
}

export default function UtilisateursPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  // Formulaire nouveau utilisateur
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'agent' as const,
  })

  // Vérifier que c'est un admin
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [currentUser, router])

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchQuery, selectedRole])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll()
      const usersList = Array.isArray(response.data) ? response.data : []
      setUsers(usersList)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = users

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtre par rôle
    if (selectedRole) {
      filtered = filtered.filter(u => u.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await usersAPI.create(formData)
      setShowAddModal(false)
      setFormData({
        email: '',
        full_name: '',
        password: '',
        role: 'agent',
      })
      loadUsers()
    } catch (error) {
      console.error('Erreur création utilisateur:', error)
      alert('Erreur lors de la création de l\'utilisateur')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUserId) return
    try {
      await usersAPI.delete(selectedUserId)
      setShowDeleteModal(false)
      setSelectedUserId(null)
      loadUsers()
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur'
      case 'agent':
        return 'Agent'
      case 'lecteur':
        return 'Lecteur'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700'
      case 'agent':
        return 'bg-blue-100 text-blue-700'
      case 'lecteur':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500'
      case 'agent':
        return 'bg-blue-500'
      case 'lecteur':
        return 'bg-green-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatistics = () => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      agents: users.filter(u => u.role === 'agent').length,
      lecteurs: users.filter(u => u.role === 'lecteur').length,
    }
  }

  const stats = getStatistics()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Utilisateurs</h1>
          <p className="text-slate-600">Gérez les utilisateurs et leurs permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un utilisateur</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-slate-600 text-sm font-medium mb-1">Total d'utilisateurs</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Administrateurs</p>
          <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Agents</p>
          <p className="text-3xl font-bold text-blue-600">{stats.agents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Lecteurs</p>
          <p className="text-3xl font-bold text-green-600">{stats.lecteurs}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Recherche */}
          <div className="flex-1 min-w-xs relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filtre rôle */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="agent">Agent</option>
            <option value="lecteur">Lecteur</option>
          </select>

          {/* Bouton réinitialiser */}
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedRole('')
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Grille d'utilisateurs */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div key={u.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              
              {/* Header carte */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                <div className={`w-12 h-12 ${getAvatarColor(u.role)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {u.full_name.charAt(0).toUpperCase()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>
                  {getRoleLabel(u.role)}
                </span>
              </div>

              {/* Info utilisateur */}
              <h3 className="font-semibold text-slate-900 mb-1">{u.full_name}</h3>
              <p className="text-sm text-slate-600 mb-4 truncate">{u.email}</p>

              {/* Détails */}
              <div className="space-y-2 mb-6 py-4 border-t border-b border-slate-200">
                {u.department && (
                  <div className="text-sm">
                    <p className="text-slate-600">Département</p>
                    <p className="text-slate-900 font-medium">{u.department}</p>
                  </div>
                )}
                <div className="text-sm">
                  <p className="text-slate-600">Statut</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <p className="text-slate-900 font-medium">
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-slate-600">Date d'ajout</p>
                  <p className="text-slate-900 font-medium">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition font-semibold text-sm">
                  <Edit2 className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedUserId(u.id)
                    setShowDeleteModal(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition font-semibold text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Retirer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 font-medium">Aucun utilisateur trouvé</p>
          <p className="text-slate-500 text-sm mt-1">Modifiez vos filtres ou ajoutez un nouvel utilisateur</p>
        </div>
      )}

      {/* Modal Ajouter utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Ajouter un utilisateur</h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="jean@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="agent">Agent</option>
                  <option value="lecteur">Lecteur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition font-semibold"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Supprimer utilisateur */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Supprimer l'utilisateur</h2>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUserId(null)
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}