// components/Navbar.tsx
'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Download, Plus, Bell } from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()

  return (
    <div className="ml-64 bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-8">
        
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>

        {/* Actions à droite */}
        <div className="flex items-center gap-4">
          
          {/* Importer */}
          <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition">
            <Download className="w-5 h-5" />
            <span>Importer</span>
          </button>

          {/* Nouveau document */}
          <Link 
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau document</span>
          </Link>

          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  )
}