// app/documents/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { documentsAPI } from '@/lib/api'
import Link from 'next/link'
import { FileText, FileImage, Sheet, FileCode, Archive, Download, Trash2, Search, Grid3x3, List } from 'lucide-react'

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

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filtres
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [documents, searchQuery, selectedFileTypes, sortBy])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentsAPI.getAll()
      const docs = Array.isArray(response.data) ? response.data : []
      // Filtrer les documents non archivés
      const activeDocuments = docs.filter((doc: Document) => !doc.is_archived)
      setDocuments(activeDocuments)
    } catch (error) {
      console.error('Erreur chargement documents:', error)
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

    // Filtre par type de fichier
    if (selectedFileTypes.length > 0) {
      filtered = filtered.filter(doc =>
        selectedFileTypes.some(type => doc.file_type.toLowerCase().includes(type.toLowerCase()))
      )
    }

    // Tri
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'size') {
      filtered.sort((a, b) => b.file_size - a.file_size)
    }

    setFilteredDocuments(filtered)
  }

  const toggleFileType = (fileType: string) => {
    setSelectedFileTypes(prev =>
      prev.includes(fileType)
        ? prev.filter(ft => ft !== fileType)
        : [...prev, fileType]
    )
  }

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />
    if (type.includes('word') || type.includes('doc')) return <FileText className="w-12 h-12 text-blue-500" />
    if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) return <Sheet className="w-12 h-12 text-green-500" />
    if (type.includes('image')) return <FileImage className="w-12 h-12 text-orange-500" />
    if (type.includes('zip')) return <Archive className="w-12 h-12 text-purple-500" />
    return <FileCode className="w-12 h-12 text-slate-500" />
  }

  const getBackgroundColor = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return 'bg-red-50'
    if (type.includes('word') || type.includes('doc')) return 'bg-blue-50'
    if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) return 'bg-green-50'
    if (type.includes('image')) return 'bg-orange-50'
    if (type.includes('zip')) return 'bg-purple-50'
    return 'bg-slate-50'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'Ko', 'Mo', 'Go']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i]
  }

  const getFileTypeStats = () => {
    const stats: { [key: string]: number } = {
      'PDF': 0,
      'Word/Docs': 0,
      'Tableurs': 0,
      'Images': 0,
      'Archives': 0,
    }

    documents.forEach(doc => {
      const type = doc.file_type.toLowerCase()
      if (type.includes('pdf')) stats['PDF']++
      else if (type.includes('word') || type.includes('doc')) stats['Word/Docs']++
      else if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) stats['Tableurs']++
      else if (type.includes('image')) stats['Images']++
      else if (type.includes('zip')) stats['Archives']++
    })

    return stats
  }

  const fileTypeStats = getFileTypeStats()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition font-semibold"
        >
          <span>+</span>
          <span>Nouveau document</span>
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Rechercher un document</h2>
        
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Nom, mot-clé, auteur, catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            <span>Rechercher</span>
          </button>
        </div>

        {/* Tags populaires */}
        <div className="flex gap-3 flex-wrap">
          {['Rapports', 'Notes de service', 'Budgets', 'Décrets', 'Circulaires', '2024'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-600 transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-4 gap-6">
        
        {/* Filtres */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            
            {/* Header Filtres */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Filtres</h3>
              <button 
                onClick={() => {
                  setSelectedFileTypes([])
                  setSearchQuery('')
                }}
                className="text-orange-600 hover:text-orange-700 text-sm font-semibold"
              >
                Réinitialiser
              </button>
            </div>

            {/* Type de fichier */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-slate-600 mb-4 uppercase">TYPE DE FICHIER</p>
              <div className="space-y-3">
                {Object.entries(fileTypeStats).map(([type, count]) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFileTypes.includes(type)}
                      onChange={() => toggleFileType(type)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{type}</span>
                    <span className="text-sm text-slate-500 ml-auto">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-4 uppercase">CATÉGORIE</p>
              <div className="space-y-3">
                {['Direction Générale', 'RH', 'Finance', 'Communication'].map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                    <span className="text-sm text-slate-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="col-span-3">
          
          {/* Options d'affichage */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">{filteredDocuments.length}</span> document{filteredDocuments.length !== 1 ? 's' : ''} trouvé{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
            
            <div className="flex items-center gap-4">
              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="recent">Plus récents</option>
                <option value="name">Par nom</option>
                <option value="size">Par taille</option>
              </select>

              {/* Vue */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Affichage en grille */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-4 gap-6">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg h-48 animate-pulse"></div>
                ))
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`${getBackgroundColor(doc.file_type)} rounded-lg p-6 hover:shadow-lg transition cursor-pointer group`}
                  >
                    <div className="flex justify-center mb-4">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-2 truncate group-hover:text-orange-600">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                      {doc.uploaded_by?.full_name || 'Utilisateur'} · {doc.uploaded_by?.department || 'Sans département'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-orange-600 uppercase">
                        {doc.file_type}
                      </span>
                      <span className="text-xs text-slate-600">
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun document trouvé</p>
                </div>
              )}
            </div>
          )}

          {/* Affichage en liste */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg h-12 animate-pulse"></div>
                ))
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getFileIcon(doc.file_type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {doc.uploaded_by?.full_name || 'Utilisateur'} · {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <span className="text-sm text-slate-600">{formatFileSize(doc.file_size)}</span>
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
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun document trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}