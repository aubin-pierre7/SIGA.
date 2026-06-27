// app/dashboard/upload/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { documentsAPI } from '@/lib/api'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadFile {
  file: File
  title: string
  description: string
  confidentiality: 'public' | 'internal' | 'confidential' | 'secret'
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const confidentialityLevels = [
    { value: 'public', label: 'Public', color: 'bg-green-100 text-green-700' },
    { value: 'internal', label: 'Interne', color: 'bg-blue-100 text-blue-700' },
    { value: 'confidential', label: 'Confidentiel', color: 'bg-orange-100 text-orange-700' },
    { value: 'secret', label: 'Secret', color: 'bg-red-100 text-red-700' },
  ]

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => addFile(file))
  }

  // Sélection de fichiers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => addFile(file))
  }

  // Ajouter un fichier à la liste
  const addFile = (file: File) => {
    const newFile: UploadFile = {
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      confidentiality: 'internal',
      progress: 0,
      status: 'pending',
    }
    setUploadedFiles(prev => [...prev, newFile])
  }

  // Mettre à jour les infos du fichier
  const updateFile = (index: number, updates: Partial<UploadFile>) => {
    setUploadedFiles(prev =>
      prev.map((file, i) => (i === index ? { ...file, ...updates } : file))
    )
  }

  // Supprimer un fichier
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Uploader tous les fichiers
  const uploadAllFiles = async () => {
    try {
      setUploading(true)

      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadFile = uploadedFiles[i]

        if (uploadFile.status !== 'pending') continue

        // Mettre à jour le statut
        updateFile(i, { status: 'uploading', progress: 0 })

        try {
          const formData = new FormData()
          formData.append('fichier', uploadFile.file)
          formData.append('titre', uploadFile.title)
          formData.append('description', uploadFile.description)
          formData.append('confidentialite', uploadFile.confidentiality)

          // Simuler la progression (en vrai, utiliser axios onUploadProgress)
          let progress = 0
          const progressInterval = setInterval(() => {
            progress += Math.random() * 30
            if (progress > 90) progress = 90
            updateFile(i, { progress: Math.floor(progress) })
          }, 200)

          // Uploader le fichier
          await documentsAPI.upload(formData)

          clearInterval(progressInterval)
          updateFile(i, { status: 'success', progress: 100 })
        } catch (error: any) {
          console.error('Erreur upload:', error)
          updateFile(i, {
            status: 'error',
            error: error.response?.data?.detail || 'Erreur lors de l\'upload',
          })
        }
      }
    } finally {
      setUploading(false)
    }
  }

  // Rediriger vers documents si tous les uploads sont réussis
  const allSuccessful = uploadedFiles.every(f => f.status === 'success')
  const hasUploads = uploadedFiles.length > 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Télécharger un document</h1>
        <p className="text-slate-600">
          Chaque fichier téléchargé sera automatiquement chiffré avec AES-256-GCM
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        
        {/* Zone de drop */}
        <div className="col-span-2">
          
          {/* Drop zone */}
          {!hasUploads && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition ${
                isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-300 bg-slate-50 hover:border-orange-400'
              }`}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Glissez vos fichiers ici
              </h2>
              <p className="text-slate-600 mb-6">
                ou cliquez pour parcourir votre ordinateur
              </p>
              
              <label className="inline-block">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition cursor-pointer font-semibold inline-block">
                  Sélectionner des fichiers
                </span>
              </label>

              <p className="text-xs text-slate-600 mt-6">
                Formats acceptés : PDF, DOC, XLS, PPT, Images, ZIP
              </p>
            </div>
          )}

          {/* Liste des fichiers */}
          {hasUploads && (
            <div className="space-y-4">
              {uploadedFiles.map((uploadFile, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition">
                  
                  {/* Info fichier */}
                  <div className="flex items-start gap-4 mb-4">
                    <FileText className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                    
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={uploadFile.title}
                        onChange={(e) => updateFile(index, { title: e.target.value })}
                        className="w-full font-semibold text-slate-900 mb-2 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Titre du document"
                        disabled={uploadFile.status !== 'pending'}
                      />
                      
                      <textarea
                        value={uploadFile.description}
                        onChange={(e) => updateFile(index, { description: e.target.value })}
                        className="w-full text-sm text-slate-600 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        placeholder="Description (optionnel)"
                        rows={2}
                        disabled={uploadFile.status !== 'pending'}
                      />
                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      disabled={uploadFile.status === 'uploading'}
                      className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded transition disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Confidentialité et infos */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    
                    {/* Sélecteur confidentialité */}
                    <div className="flex gap-2">
                      {confidentialityLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => updateFile(index, { confidentiality: level.value as any })}
                          disabled={uploadFile.status !== 'pending'}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            uploadFile.confidentiality === level.value
                              ? level.color
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          } disabled:opacity-50`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>

                    {/* Infos fichier */}
                    <span className="text-xs text-slate-600">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} Mo
                    </span>
                  </div>

                  {/* Barre de progression */}
                  {uploadFile.status !== 'pending' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">
                          {uploadFile.status === 'uploading' && `Téléchargement... ${uploadFile.progress}%`}
                          {uploadFile.status === 'success' && '✓ Téléchargé'}
                          {uploadFile.status === 'error' && '✗ Erreur'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            uploadFile.status === 'success'
                              ? 'bg-green-500'
                              : uploadFile.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${uploadFile.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Message d'erreur */}
                  {uploadFile.status === 'error' && uploadFile.error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{uploadFile.error}</span>
                    </div>
                  )}

                  {/* Succès */}
                  {uploadFile.status === 'success' && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Document archivé et chiffré avec succès</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Bouton ajouter plus */}
              <label className="block">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-6 py-3 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition cursor-pointer font-semibold inline-block w-full text-center">
                  Ajouter d'autres documents
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Sidebar infos */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20 space-y-6">
            
            {/* Statistiques */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Téléchargements</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{uploadedFiles.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Succès</p>
                  <p className="text-2xl font-bold text-green-600">
                    {uploadedFiles.filter(f => f.status === 'success').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">En cours</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {uploadedFiles.filter(f => f.status === 'uploading').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Erreurs</p>
                  <p className="text-2xl font-bold text-red-600">
                    {uploadedFiles.filter(f => f.status === 'error').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Niveaux de confidentialité */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Niveaux de confidentialité</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-700"><strong>Public</strong> - Accessible à tous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700"><strong>Interne</strong> - Employés seulement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-slate-700"><strong>Confidentiel</strong> - Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-700"><strong>Secret</strong> - Direction générale</span>
                </div>
              </div>
            </div>

            {/* Info chiffrement */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Chiffrement</h4>
              <p className="text-xs text-blue-800">
                Tous les documents sont chiffrés avec AES-256-GCM et stockés de manière sécurisée.
              </p>
            </div>

            {/* Bouton upload */}
            {hasUploads && (
              <button
                onClick={uploadAllFiles}
                disabled={uploading || uploadedFiles.every(f => f.status !== 'pending')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Téléchargement en cours...' : 'Télécharger les documents'}
              </button>
            )}

            {/* Lien retour si succès */}
            {allSuccessful && hasUploads && (
              <button
                onClick={() => router.push('/dashboard/documents')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Voir les documents
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}