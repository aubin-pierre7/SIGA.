// app/dashboard/parametres/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { User, Lock, Bell, Shield, Download, LogOut } from 'lucide-react'

export default function ParametresPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'profil' | 'securite' | 'notifications'>('profil')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  // Formulaires
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    department: '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [notifications, setNotifications] = useState({
    email_uploads: true,
    email_shares: true,
    email_weekly: false,
    email_monthly: true,
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Mise à jour profil:', profileData)
    alert('Profil mis à jour avec succès')
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    console.log('Mot de passe changé')
    alert('Mot de passe changé avec succès')
    setShowPasswordModal(false)
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Paramètres</h1>
        <p className="text-slate-600">Gérez votre profil et vos préférences</p>
      </div>

      <div className="grid grid-cols-4 gap-8">
        
        {/* Sidebar tabs */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden sticky top-20">
            <div className="space-y-1 p-4">
              
              {/* Mon profil */}
              <button
                onClick={() => setActiveTab('profil')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left font-semibold ${
                  activeTab === 'profil'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Mon profil</span>
              </button>

              {/* Sécurité */}
              <button
                onClick={() => setActiveTab('securite')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left font-semibold ${
                  activeTab === 'securite'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span>Sécurité</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left font-semibold ${
                  activeTab === 'notifications'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
            </div>

            {/* Separator */}
            <div className="border-t border-slate-200"></div>

            {/* Déconnexion */}
            <div className="p-4">
              <button
                onClick={() => {
                  logout()
                  window.location.href = '/login'
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="col-span-3">
          
          {/* Mon profil */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-lg shadow p-8 space-y-8">
              
              {/* Avatar */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Mon profil</h2>
                
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
                  <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {user?.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{user?.full_name}</h3>
                    <p className="text-slate-600">{user?.email}</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold capitalize">
                      {user?.role}
                    </div>
                  </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled
                    />
                    <p className="text-xs text-slate-600 mt-1">L'email ne peut pas être changé</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Département
                    </label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Direction Générale"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition font-semibold"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Sécurité */}
          {activeTab === 'securite' && (
            <div className="bg-white rounded-lg shadow p-8 space-y-8">
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Sécurité</h2>
                
                {/* Changer mot de passe */}
                <div className="border border-slate-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Mot de passe</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Changez votre mot de passe pour sécuriser votre compte
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition font-semibold"
                    >
                      Changer
                    </button>
                  </div>
                </div>

                {/* Sessions actives */}
                <div className="border border-slate-200 rounded-lg p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Sessions actives</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">Navigateur actuel</p>
                        <p className="text-sm text-slate-600">Chrome sur Windows</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        Actif maintenant
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentification 2FA */}
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">Authentification à deux facteurs</h4>
                    <p className="text-sm text-blue-800 mb-4">
                      Ajoutez une couche de sécurité supplémentaire à votre compte
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-semibold text-sm">
                      Activer 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-8 space-y-8">
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Notifications</h2>
                
                <div className="space-y-4">
                  
                  {/* Upload notifications */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    <div>
                      <p className="font-semibold text-slate-900">Nouveaux uploads</p>
                      <p className="text-sm text-slate-600">Recevez une notification quand un nouveau document est téléchargé</p>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={notifications.email_uploads}
                        onChange={(e) => setNotifications({ ...notifications, email_uploads: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-full h-full ${notifications.email_uploads ? 'bg-orange-500' : 'bg-slate-300'} rounded-full transition`}></div>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${notifications.email_uploads ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </label>
                  </div>

                  {/* Share notifications */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    <div>
                      <p className="font-semibold text-slate-900">Partages de documents</p>
                      <p className="text-sm text-slate-600">Recevez une notification quand un document est partagé avec vous</p>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={notifications.email_shares}
                        onChange={(e) => setNotifications({ ...notifications, email_shares: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-full h-full ${notifications.email_shares ? 'bg-orange-500' : 'bg-slate-300'} rounded-full transition`}></div>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${notifications.email_shares ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </label>
                  </div>

                  {/* Weekly digest */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    <div>
                      <p className="font-semibold text-slate-900">Résumé hebdomadaire</p>
                      <p className="text-sm text-slate-600">Recevez un résumé hebdomadaire des activités</p>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={notifications.email_weekly}
                        onChange={(e) => setNotifications({ ...notifications, email_weekly: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-full h-full ${notifications.email_weekly ? 'bg-orange-500' : 'bg-slate-300'} rounded-full transition`}></div>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${notifications.email_weekly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </label>
                  </div>

                  {/* Monthly report */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    <div>
                      <p className="font-semibold text-slate-900">Rapport mensuel</p>
                      <p className="text-sm text-slate-600">Recevez un rapport mensuel complet de votre activité</p>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={notifications.email_monthly}
                        onChange={(e) => setNotifications({ ...notifications, email_monthly: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-full h-full ${notifications.email_monthly ? 'bg-orange-500' : 'bg-slate-300'} rounded-full transition`}></div>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${notifications.email_monthly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => console.log('Notifications sauvegardées:', notifications)}
                  className="mt-6 px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition font-semibold"
                >
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Changer mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Changer le mot de passe</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition font-semibold"
                >
                  Changer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}