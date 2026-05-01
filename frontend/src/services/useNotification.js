import { useState, useCallback } from 'react'

export const useNotification = () => {
  const [notifications, setNotifications] = useState([])

  // Ajoute une notification
  const notifier = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
  }, [])

  // Supprime une notification par id
  const supprimer = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Raccourcis pratiques
  const succes = useCallback((msg) => notifier(msg, 'succes'), [notifier])
  const erreur = useCallback((msg) => notifier(msg, 'erreur'), [notifier])
  const attention = useCallback((msg) => notifier(msg, 'attention'), [notifier])
  const info = useCallback((msg) => notifier(msg, 'info'), [notifier])

  return { notifications, supprimer, succes, erreur, attention, info }
}