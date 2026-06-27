// app/dashboard/archives/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { documentsAPI } from '@/lib/api'
import { Search, Download, Trash2, FileText, Archive, Calendar } from 'lucide-react'

interface Document {
  id: number
  title: string
  filename: string
  file_type: string
  file_size: number
  uploaded_by: any
  created_at: string
  is_archived: boolean
}

export default function ArchivesPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('')

  useEffect(() => {
    loadArchives()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [documents, searchQuery, selectedYear])

  const loadArchives = async () => {
    try {
      setLoading(true)
      const response = await documentsAPI.getAll()
      const docs = Array.isArray(response.data) ? response.data : []
      // Filtrer les documents archivés
      const archivedDocuments = docs.filter((doc: Document) => doc.is_archived)
      setDocuments(archivedDocuments)
    } catch (error) {
      console.error('Erreur chargement archives:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = documents

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtre par année
    if (selectedYear) {
      filtered = filtered.filter(doc => {
        const year = new Date(doc.created_at).getFullYear().toString()
        return year === selectedYear
      })
    }

    setFilteredDocuments(filtered)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'Ko', 'Mo', 'Go']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i]
  }

  const getYears = () => {
    const years = new Set(documents.map(d => new Date(d.created_at).getFullYear().toString()))
    return Array.from(years).sort().reverse()
  }

  const groupedByYear = documents.reduce((acc, doc) => {
    const year = new Date(doc.created_at).getFullYear().toString()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(doc)
    return acc
  }, {} as { [key: string]: Document[] })

  const years = getYears()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Archives</h1>
        <p className="text-slate-600">
          Consultez les documents archivés organisés par année
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-slate-600 text-sm font-medium mb-1">Documents archivés</p>
          <p className="text-3xl font-bold text-slate-900">{documents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Périodes</p>
          <p className="text-3xl font-bold text-orange-600">{years.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-slate-600 text-sm font-medium mb-1">Espace utilisé</p>
          <p className="text-3xl font-bold text-blue-600">
            {(documents.reduce((sum, d) => sum + d.file_size, 0) / 1024 / 1024 / 1024).toFixed(1)} Go
          </p>
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
              placeholder="Rechercher dans les archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filtre année */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Toutes les années</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Réinitialiser */}
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedYear('')
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Archives par année */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-lg h-40 animate-pulse"></div>
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="space-y-8">
          {years.map(year => {
            const yearDocs = filteredDocuments.filter(doc => 
              new Date(doc.created_at).getFullYear().toString() === year
            )
            
            if (yearDocs.length === 0) return null

            return (
              <div key={year}>
                {/* Header année */}
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-slate-900">{year}</h2>
                  <span className="text-sm text-slate-600">
                    ({yearDocs.length} document{yearDocs.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* Documents de l'année */}
                <div className="space-y-3">
                  {yearDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition">
                          <FileText className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">
                            {doc.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>{doc.uploaded_by?.full_name || 'Utilisateur'}</span>
                            <span>•</span>
                            <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-right">
                        <div className="text-sm">
                          <p className="text-slate-600">Type</p>
                          <p className="font-semibold text-slate-900">{doc.file_type}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-slate-600">Taille</p>
                          <p className="font-semibold text-slate-900">{formatFileSize(doc.file_size)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded transition">
                            <Download className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded transition">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Archive className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 font-medium">Aucun document archivé trouvé</p>
          <p className="text-slate-500 text-sm mt-1">Les documents archivés apparaîtront ici</p>
        </div>
      )}
    </div>
  )
}