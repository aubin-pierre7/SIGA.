// app/dashboard/audit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { auditAPI } from '@/lib/api'
import { Search, Filter, Download, ArrowUpRight, Eye, Trash2, Plus, FileText } from 'lucide-react'

interface AuditLog {
  id: number
  user_id: number
  utilisateur?: string
  action: string
  type?: string
  document?: {
    id: number
    title: string
  }
  document_id?: number
  timestamp: string
  created_at: string
  details?: string
}

export default function AuditPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')

  const actionTypes = [
    { value: 'upload', label: 'Ajout', icon: ArrowUpRight, color: 'text-orange-500' },
    { value: 'modification', label: 'Modification', icon: FileText, color: 'text-orange-500' },
    { value: 'download', label: 'Téléchargement', icon: ArrowUpRight, color: 'text-teal-500' },
    { value: 'view', label: 'Consultation', icon: Eye, color: 'text-blue-500' },
    { value: 'delete', label: 'Suppression', icon: Trash2, color: 'text-red-500' },
  ]

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, searchQuery, selectedAction, selectedUser])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await auditAPI.getAllLogs()
      const allLogs = Array.isArray(response.data) ? response.data : []
      setLogs(allLogs)
    } catch (error) {
      console.error('Erreur chargement audit:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = logs

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.utilisateur?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.document?.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtre par action
    if (selectedAction) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(selectedAction.toLowerCase()) ||
        log.type?.toLowerCase().includes(selectedAction.toLowerCase())
      )
    }

    // Filtre par utilisateur
    if (selectedUser) {
      filtered = filtered.filter(log =>
        log.utilisateur?.toLowerCase().includes(selectedUser.toLowerCase())
      )
    }

    // Trier par date décroissante
    filtered.sort((a, b) => 
      new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
    )

    setFilteredLogs(filtered)
  }

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase()
    const actionType = actionTypes.find(at => actionLower.includes(at.value))
    const Icon = actionType?.icon || FileText
    const color = actionType?.color || 'text-slate-500'
    return <Icon className={`w-5 h-5 ${color}`} />
  }

  const getActionLabel = (action: string) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes('upload') || actionLower.includes('ajout')) return 'Ajout'
    if (actionLower.includes('modification') || actionLower.includes('modifi')) return 'Modification'
    if (actionLower.includes('download') || actionLower.includes('telecharge')) return 'Téléchargement'
    if (actionLower.includes('consultation') || actionLower.includes('consulta') || actionLower.includes('view')) return 'Consultation'
    if (actionLower.includes('delete') || actionLower.includes('suppression')) return 'Suppression'
    return action
  }

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes('upload') || actionLower.includes('ajout')) return 'bg-orange-50 text-orange-700'
    if (actionLower.includes('modification')) return 'bg-yellow-50 text-yellow-700'
    if (actionLower.includes('download')) return 'bg-teal-50 text-teal-700'
    if (actionLower.includes('consultation') || actionLower.includes('view')) return 'bg-blue-50 text-blue-700'
    if (actionLower.includes('delete') || actionLower.includes('suppression')) return 'bg-red-50 text-red-700'
    return 'bg-slate-50 text-slate-700'
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const getStatistics = () => {
    const stats = {
      total: logs.length,
      uploads: logs.filter(l => l.action.toLowerCase().includes('upload') || l.action.toLowerCase().includes('ajout')).length,
      modifications: logs.filter(l => l.action.toLowerCase().includes('modification')).length,
      downloads: logs.filter(l => l.action.toLowerCase().includes('download') || l.action.toLowerCase().includes('telecharge')).length,
      deletions: logs.filter(l => l.action.toLowerCase().includes('delete') || l.action.toLowerCase().includes('suppression')).length,
    }
    return stats
  }

  const stats = getStatistics()
  const uniqueUsers = [...new Set(logs.map(l => l.utilisateur))].filter(Boolean)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Journal d'activité</h1>
          <p className="text-slate-600">Consultez tous les événements et actions effectuées sur la plateforme</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition font-semibold">
          <Download className="w-5 h-5" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-slate-600 text-sm font-medium mb-1">Total d'actions</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Ajouts</p>
          <p className="text-3xl font-bold text-orange-600">{stats.uploads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Modifications</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.modifications}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Téléchargements</p>
          <p className="text-3xl font-bold text-teal-600">{stats.downloads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Suppressions</p>
          <p className="text-3xl font-bold text-red-600">{stats.deletions}</p>
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
              placeholder="Rechercher une action, utilisateur, document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filtre action */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Toutes les actions</option>
            {actionTypes.map(action => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>

          {/* Filtre utilisateur */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tous les utilisateurs</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u || ''}>
                {u}
              </option>
            ))}
          </select>

          {/* Bouton réinitialiser */}
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedAction('')
              setSelectedUser('')
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Journal d'activité */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        {/* Header tableau */}
        <div className="hidden md:grid grid-cols-5 gap-4 p-6 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-sm">
          <div>Utilisateur</div>
          <div>Action</div>
          <div>Document</div>
          <div>Date & Heure</div>
          <div>Détails</div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  
                  {/* Utilisateur */}
                  <div>
                    <p className="font-semibold text-slate-900">{log.utilisateur || 'Utilisateur'}</p>
                    <p className="text-xs text-slate-600 md:hidden">Utilisateur</p>
                  </div>

                  {/* Action */}
                  <div>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 md:hidden mt-1">Action</p>
                  </div>

                  {/* Document */}
                  <div>
                    <p className="text-slate-900 truncate">
                      {log.document?.title || log.action}
                    </p>
                    <p className="text-xs text-slate-600 md:hidden">Document</p>
                  </div>

                  {/* Date & Heure */}
                  <div>
                    <p className="text-slate-900 text-sm">
                      {formatDate(log.timestamp || log.created_at)}
                    </p>
                    <p className="text-xs text-slate-600 md:hidden">Date & Heure</p>
                  </div>

                  {/* Détails */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-600 hover:bg-slate-200 rounded transition">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 font-medium">Aucun enregistrement trouvé</p>
            <p className="text-slate-500 text-sm mt-1">Modifiez vos filtres pour voir d'autres résultats</p>
          </div>
        )}
      </div>

      {/* Pagination info */}
      {filteredLogs.length > 0 && (
        <div className="mt-6 text-center text-sm text-slate-600">
          Affichage de <span className="font-semibold">{filteredLogs.length}</span> enregistrement{filteredLogs.length !== 1 ? 's' : ''} sur <span className="font-semibold">{logs.length}</span>
        </div>
      )}
    </div>
  )
}