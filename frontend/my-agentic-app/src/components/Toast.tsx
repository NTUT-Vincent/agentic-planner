'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'ai'

export interface ToastProps {
  message: string
  type?: ToastType
  title?: string
  isVisible: boolean
  onClose: () => void
  autoHideDuration?: number // in milliseconds, 0 means no auto-hide
  showCloseButton?: boolean
  icon?: string
  position?: 'top' | 'top-right' | 'top-left'
}

const typeStyles = {
  info: {
    container: 'border-mabel-200 bg-mabel-50 text-mabel-800 shadow-lg',
    title: 'text-mabel-900',
    closeButton: 'text-mabel-600 hover:text-mabel-800'
  },
  success: {
    container: 'border-green-200 bg-green-50 text-green-800 shadow-lg',
    title: 'text-green-900',
    closeButton: 'text-green-600 hover:text-green-800'
  },
  warning: {
    container: 'border-yellow-200 bg-yellow-50 text-yellow-800 shadow-lg',
    title: 'text-yellow-900',
    closeButton: 'text-yellow-600 hover:text-yellow-800'
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-800 shadow-lg',
    title: 'text-red-900',
    closeButton: 'text-red-600 hover:text-red-800'
  },
  ai: {
    container: 'border-mabel-300 bg-mabel-100 text-mabel-800 shadow-lg',
    title: 'text-mabel-900',
    closeButton: 'text-mabel-600 hover:text-mabel-800'
  }
}

const defaultIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  ai: '🤖'
}

const positionStyles = {
  'top': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4'
}

export default function Toast({
  message,
  type = 'info',
  title,
  isVisible,
  onClose,
  autoHideDuration = 5000,
  showCloseButton = true,
  icon,
  position = 'top'
}: ToastProps) {
  const [mounted, setMounted] = useState(false)


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHideDuration, onClose, message])

  const handleClose = () => {
    onClose()
  }

  if (!mounted || !isVisible) return null

  const styles = typeStyles[type]
  const displayIcon = icon || defaultIcons[type]

  const toastContent = (
    <div 
      className={`fixed ${positionStyles[position]} z-[9999] max-w-md w-auto min-w-80 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
      style={{ 
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999
      }}
    >
      <div className={`p-4 border rounded-lg text-sm ${styles.container}`}>
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
              className={`ml-2 transition-colors ${styles.closeButton} hover:bg-white hover:bg-opacity-20 rounded p-1`}
              title="Close notification"
              aria-label="Close notification"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(toastContent, document.body)
}
