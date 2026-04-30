import axios from 'axios'

// Instance Axios pointant vers le backend SIGA
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000,
})

// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('siga_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gère les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Connexion utilisateur avec format OAuth2
export const connexion = async (email, motDePasse) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', motDePasse)
  const rep = await api.post('/api/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  localStorage.setItem('siga_token', rep.data.access_token)
  localStorage.setItem('siga_role', rep.data.role)
  localStorage.setItem('siga_nom', rep.data.nom)
  localStorage.setItem('siga_prenom', rep.data.prenom)
  return rep.data
}

// Déconnexion
export const deconnexion = () => {
  localStorage.clear()
  window.location.href = '/login'
}

// Infos utilisateur connecté
export const obtenirUtilisateurActuel = async () => {
  const rep = await api.get('/api/auth/moi')
  return rep.data
}

// Liste des documents
export const listerDocuments = async () => {
  const rep = await api.get('/api/documents/')
  return rep.data
}

// Upload d'un document
export const uploaderDocument = async (formData) => {
  const rep = await api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return rep.data
}

// Téléchargement d'un document
export const telechargerDocument = async (id, nomFichier) => {
  const rep = await api.get(`/api/documents/${id}/telecharger`, {
    responseType: 'blob'
  })
  const url = window.URL.createObjectURL(new Blob([rep.data]))
  const lien = document.createElement('a')
  lien.href = url
  lien.setAttribute('download', nomFichier)
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
}

// Suppression d'un document
export const supprimerDocument = async (id) => {
  const rep = await api.delete(`/api/documents/${id}`)
  return rep.data
}

// Logs d'audit (admin)
export const obtenirLogs = async () => {
  const rep = await api.get('/api/audit/logs')
  return rep.data
}

// Statistiques globales (admin)
export const obtenirStatistiques = async () => {
  const rep = await api.get('/api/audit/statistiques')
  return rep.data
}

// Mes activités
export const obtenirMesActivites = async () => {
  const rep = await api.get('/api/audit/mes-activites')
  return rep.data
}

export default api