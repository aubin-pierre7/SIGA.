import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './services/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Upload from './pages/Upload'
import Audit from './pages/Audit'
import { useAuth } from './services/useAuth'

// Layout avec Navbar pour les pages protégées
const LayoutAvecNavbar = () => {
  const { estConnecte } = useAuth()
  if (!estConnecte && !localStorage.getItem('siga_token')) return null
  return <Navbar />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />

          {/* Routes protégées avec Navbar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <><LayoutAvecNavbar /><Dashboard /></>
            } />
            <Route path="/documents" element={
              <><LayoutAvecNavbar /><Documents /></>
            } />
          </Route>

          {/* Routes agent et admin */}
          <Route element={<ProtectedRoute rolesAutorises={['admin', 'agent']} />}>
            <Route path="/upload" element={
              <><LayoutAvecNavbar /><Upload /></>
            } />
          </Route>

          {/* Routes admin seulement */}
          <Route element={<ProtectedRoute rolesAutorises={['admin']} />}>
            <Route path="/audit" element={
              <><LayoutAvecNavbar /><Audit /></>
            } />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App