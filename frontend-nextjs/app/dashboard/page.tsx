// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { documentsAPI } from '@/lib/api'
import Link from 'next/link'
import { FileText, Folder, Users, HardDrive, ArrowUpRight } from 'lucide-react'

interface DashboardStats {
  totalDocuments: number
  activeDocuments: number
  totalUsers: number
  storageUsed: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    activeDocuments: 0,
    totalUsers: 0,
    storageUsed: 68,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les documents
      const docsResponse = await documentsAPI.getAll()
      const documents = Array.isArray(docsResponse.data) ? docsResponse.data : []
      
      const totalDocs = documents.length
      const activeDocs = documents.filter((doc: any) => !doc.is_archived).length

      setStats({
        totalDocuments: totalDocs,
        activeDocuments: activeDocs,
        totalUsers: 0, // À implémenter avec vrai endpoint
        storageUsed: 68,
      })

      // Données d'exemple pour l'activité récente
      setRecentActivities([
        {
          id: 1,
          user: user?.full_name || 'Utilisateur',
          action: 'Rapport_Annuel_2024.pdf',
          type: 'upload',
          timestamp: 'Il y a 5 min',
        },
        {
          id: 2,
          user: 'Aubin',
          action: 'Note_Service_052.docx',
          type: 'modification',
          timestamp: 'Il y a 22 min',
        },
        {
          id: 3,
          user: 'Samuela',
          action: 'Photos_Ceremonie.zip',
          type: 'download',
          timestamp: 'Il y a 1h',
        },
        {
          id: 4,
          user: 'Moubarack',
          action: 'Budget_Q2_2024.xlsx',
          type: 'view',
          timestamp: 'Il y a 2h',
        },
        {
          id: 5,
          user: 'Fallone',
          action: 'Decret_N18_Gouvernance.pdf',
          type: 'upload',
          timestamp: 'Il y a 3h',
        },
      ])
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
      setStats({
        totalDocuments: 0,
        activeDocuments: 0,
        totalUsers: 0,
        storageUsed: 68,
      })
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <ArrowUpRight className="w-4 h-4 text-orange-500" />
      case 'download':
        return <ArrowUpRight className="w-4 h-4 text-teal-500 rotate-180" />
      case 'modification':
        return <FileText className="w-4 h-4 text-orange-500" />
      case 'view':
        return <FileText className="w-4 h-4 text-teal-500" />
      default:
        return <FileText className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bienvenue, {user?.full_name}!
        </h1>
        <p className="text-slate-600">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Statistiques en cartes */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        
        {/* Documents */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600 hover:shadow-lg transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Documents archivés</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalDocuments}</p>
              <p className="text-xs text-blue-600 mt-2">📈 +12% ce mois</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Documents actifs */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600 hover:shadow-lg transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Dossiers actifs</p>
              <p className="text-3xl font-bold text-slate-900">{stats.activeDocuments}</p>
              <p className="text-xs text-green-600 mt-2">📈 4 nouveaux</p>
            </div>
            <Folder className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        {/* Utilisateurs */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600 hover:shadow-lg transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Utilisateurs</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalUsers || '-'}</p>
              <p className="text-xs text-orange-600 mt-2">✅ Tous actifs</p>
            </div>
            <Users className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </div>

        {/* Stockage */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600 hover:shadow-lg transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Stockage utilisé</p>
              <p className="text-3xl font-bold text-slate-900">{stats.storageUsed}%</p>
              <p className="text-xs text-purple-600 mt-2">💾 68 Go / 100 Go</p>
            </div>
            <HardDrive className="w-10 h-10 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Activité récente */}
        <div className="col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Activité récente</h2>
            <Link href="/audit" className="text-orange-600 hover:text-orange-700 text-sm font-semibold flex items-center gap-1">
              Voir tout
              <ArrowUpRight className="w-4 h-4 rotate-90" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {activity.user?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{activity.user}</p>
                      <p className="text-xs text-slate-600">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <p className="text-xs text-slate-600 w-16 text-right">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Aucune activité récente</p>
            </div>
          )}
        </div>

        {/* Stockage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Stockage</h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#f59e0b"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${Math.PI * 100 * (stats.storageUsed / 100)} ${Math.PI * 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{stats.storageUsed}%</p>
                  <p className="text-xs text-slate-600">utilisé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Détails stockage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">PDF</span>
              <span className="text-sm font-semibold text-slate-900">28 Go</span>
              <div className="w-16 h-2 bg-red-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Docs</span>
              <span className="text-sm font-semibold text-slate-900">14 Go</span>
              <div className="w-16 h-2 bg-teal-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Images</span>
              <span className="text-sm font-semibold text-slate-900">11 Go</span>
              <div className="w-16 h-2 bg-orange-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tableurs</span>
              <span className="text-sm font-semibold text-slate-900">8 Go</span>
              <div className="w-16 h-2 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* À propos */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-2">À propos de SIGA</h3>
        <p className="text-blue-800 text-sm">
          SIGA est un système d'archivage numérique sécurisé conçu pour les administrations. 
          Chaque document téléchargé est automatiquement chiffré avec l'algorithme AES-256-GCM, 
          analysé par IA, et toutes les actions sont tracées dans un journal d'audit complet.
        </p>
      </div>
    </div>
  )
}