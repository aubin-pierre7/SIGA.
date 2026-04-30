import { createContext, useState } from 'react'
import { connexion, deconnexion } from './api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem('siga_token') || null
  )
  const [role, setRole] = useState(
    localStorage.getItem('siga_role') || null
  )
  const [utilisateur, setUtilisateur] = useState(() => {
    const nom = localStorage.getItem('siga_nom')
    const prenom = localStorage.getItem('siga_prenom')
    const role = localStorage.getItem('siga_role')
    if (nom && prenom) {
      return { nom, prenom, role }
    }
    return null
  })

  const login = async (email, motDePasse) => {
    const data = await connexion(email, motDePasse)
    console.log("Data reçue après connexion:", data)
    setToken(data.access_token)
    setRole(data.role)
    setUtilisateur({
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
    })
    return data.role
  }

  const logout = () => {
    setToken(null)
    setRole(null)
    setUtilisateur(null)
    deconnexion()
  }

  return (
    <AuthContext.Provider value={{
      utilisateur,
      token,
      role,
      estConnecte: !!token,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}