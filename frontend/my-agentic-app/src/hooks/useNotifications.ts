'use client'

import { useState, useCallback } from 'react'
import { NotificationType } from '@/components/Notification'

export interface NotificationState {
  id: string
  message: string
  type: NotificationType
  title?: string
  isVisible: boolean
  autoHideDuration?: number
  showCloseButton?: boolean
  icon?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationState[]>([])

  const showNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    options?: {
      title?: string
      autoHideDuration?: number
      showCloseButton?: boolean
      icon?: string
    }
  ) => {
    const id = Date.now().toString()
    const notification: NotificationState = {
      id,
      message,
      type,
      isVisible: true,
      ...options
    }

    setNotifications(prev => [...prev, notification])
    return id
  }, [])

  const showAINotification = useCallback((message: string, title?: string) => {
    return showNotification(message, 'ai', {
      title: title || 'AI Analysis Complete',
      autoHideDuration: 5000
    })
  }, [showNotification])

  const showSuccessNotification = useCallback((message: string, title?: string) => {
    return showNotification(message, 'success', { title })
  }, [showNotification])

  const showErrorNotification = useCallback((message: string, title?: string) => {
    return showNotification(message, 'error', { title })
  }, [showNotification])

  const showInfoNotification = useCallback((message: string, title?: string) => {
    return showNotification(message, 'info', { title })
  }, [showNotification])

  const showWarningNotification = useCallback((message: string, title?: string) => {
    return showNotification(message, 'warning', { title })
  }, [showNotification])

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isVisible: false }
          : notification
      )
    )

    // Remove from array after animation completes
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id))
    }, 300)
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    showNotification,
    showAINotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
    showWarningNotification,
    hideNotification,
    clearAllNotifications
  }
}
