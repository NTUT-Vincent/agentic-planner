'use client'

import { useState, useEffect } from 'react'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'ai'

export interface NotificationProps {
  message: string
  type?: NotificationType
  title?: string
  isVisible: boolean
  onClose: () => void
  autoHideDuration?: number // in milliseconds, 0 means no auto-hide
  showCloseButton?: boolean
  icon?: string
}

const typeStyles = {
  info: {
    container: 'border-mabel-200 bg-mabel-50 text-mabel-800',
    title: 'text-mabel-900',
    closeButton: 'text-mabel-600 hover:text-mabel-800'
  },
  success: {
    container: 'border-green-200 bg-green-50 text-green-800',
    title: 'text-green-900',
    closeButton: 'text-green-600 hover:text-green-800'
  },
  warning: {
    container: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    title: 'text-yellow-900',
    closeButton: 'text-yellow-600 hover:text-yellow-800'
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-800',
    title: 'text-red-900',
    closeButton: 'text-red-600 hover:text-red-800'
  },
  ai: {
    container: 'border-mabel-300 bg-mabel-100 text-mabel-800',
    title: 'text-mabel-900',
    closeButton: 'text-mabel-600 hover:text-mabel-800'
  }
}

const defaultIcons = {
  info: 'i',
  success: '✓',
  warning: '!',
  error: '✗',
  ai: 'AI'
}

export default function Notification({
  message,
  type = 'info',
  title,
  isVisible,
  onClose,
  autoHideDuration = 5000,
  showCloseButton = true,
  icon
}: NotificationProps) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (show && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setShow(false)
        onClose()
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [show, autoHideDuration, onClose])

  const handleClose = () => {
    setShow(false)
    onClose()
  }

  if (!show) return null

  const styles = typeStyles[type]
  const displayIcon = icon || defaultIcons[type]

  return (
    <div className={`mb-4 p-3 border rounded-lg text-sm relative transition-all duration-300 ${styles.container}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <div className={`font-medium mb-1 ${styles.title}`}>
              {displayIcon && <span className="mr-2">{displayIcon}</span>}
              {title}
            </div>
          )}
          <div className={title ? '' : 'flex items-start'}>
            {!title && displayIcon && <span className="mr-2 mt-0.5">{displayIcon}</span>}
            <div className="flex-1">{message}</div>
          </div>
        </div>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className={`ml-2 transition-colors ${styles.closeButton}`}
            title="Close notification"
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
