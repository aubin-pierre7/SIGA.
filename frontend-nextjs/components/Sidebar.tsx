// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { LayoutDashboard, FileText, Upload, Archive, Users, LogOut } from 'lucide-react'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
    },
    {
      label: 'Télécharger',
      href: '/upload',
      icon: Upload,
    },
    {
      label: 'Archives',
      href: '/archives',
      icon: Archive,
    },
  ]

  const managementItems = [
    {
      label: 'Utilisateurs',
      href: '/utilisateurs',
      icon: Users,
      adminOnly: true,
    },
  ]

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SIGA</h1>
            <p className="text-xs text-slate-400">Gestion d'Archives</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {/* Section NAVIGATION */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-400 mb-4 px-3">NAVIGATION</p>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 text-slate-300 hover:text-white"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Section GESTION */}
        {user?.role === 'admin' && (
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-4 px-3">GESTION</p>
            <ul className="space-y-2">
              {managementItems.map((item) => {
                const Icon = item.icon
                return (
                  (!item.adminOnly || user?.role === 'admin') && (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition duration-200 text-slate-300 hover:text-white"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                )
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Utilisateur */}
      {user && (
        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <p className="text-xs text-orange-400 font-semibold capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  )
}