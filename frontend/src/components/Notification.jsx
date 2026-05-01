import { useState, useEffect } from 'react'

// Types de notifications avec leurs couleurs
const styles = {
  succes: 'bg-green-50 border-green-400 text-green-800',
  erreur: 'bg-red-50 border-red-400 text-red-800',
  attention: 'bg-orange-50 border-orange-400 text-orange-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
}

const icones = {
  succes: '✓',
  erreur: '✕',
  attention: '⚠',
  info: 'ℹ',
}

// Composant notification individuelle
export const Notification = ({ type, message, onFermer }) => {
  useEffect(() => {
    const timer = setTimeout(onFermer, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4
      shadow-md animate-pulse-once ${styles[type] || styles.info}
      transition-all duration-300`}>
      <span className="font-bold text-lg leading-none mt-0.5">
        {icones[type]}
      </span>
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={onFermer}
        className="text-lg leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}

// Conteneur de toutes les notifications
export const NotificationContainer = ({ notifications, supprimer }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-full">
    {notifications.map((n) => (
      <Notification
        key={n.id}
        type={n.type}
        message={n.message}
        onFermer={() => supprimer(n.id)}
      />
    ))}
  </div>
)