'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit, Copy, Flag, Play, Settings, Info } from 'lucide-react'

interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  items: ContextMenuItem[]
}

interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ComponentType<any>
  action: () => void
  disabled?: boolean
  variant?: 'default' | 'danger' | 'warning'
}

export function ContextMenu({ isOpen, position, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const getItemStyles = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
      default:
        return 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                if (!item.disabled) {
                  item.action()
                  onClose()
                }
              }}
              disabled={item.disabled}
              className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                item.disabled 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : getItemStyles(item.variant)
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-3" />}
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}





