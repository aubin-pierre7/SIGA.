// lib/api.ts
import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'
const TOKEN_KEY = process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'siga_token'

// Créer instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur requête - Ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur réponse - Gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ==================== AUTH API ====================

export const authAPI = {
  // Envoyer les données en URLSearchParams pour OAuth2 PasswordRequestForm
  login: (email: string, password: string) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    return api.post('/auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
  
  register: (email: string, password: string, fullName: string, role: string) =>
    api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      role,
    }),
}

// ==================== DOCUMENTS API ====================

export const documentsAPI = {
  getAll: () => api.get('/documents'),
  
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  download: (id: string) =>
    api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    }),
  
  delete: (id: string) => api.delete(`/documents/${id}`),
}

// ==================== OCR API ====================

export const ocrAPI = {
  preview: (file: File) => {
    const formData = new FormData()
    formData.append('fichier', file)
    return api.post('/ocr/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ==================== AUDIT API ====================

export const auditAPI = {
  getAll: () => api.get('/audit'),
  filterByAction: (action: string) => api.get(`/audit?action=${action}`),
}

// ==================== USERS API ====================

export const usersAPI = {
  getAll: () => api.get('/utilisateurs'),
  create: (data: any) => api.post('/utilisateurs', data),
  delete: (id: number) => api.delete(`/utilisateurs/${id}`),
}