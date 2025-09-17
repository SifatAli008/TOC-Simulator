'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Edit, 
  Trash2, 
  Plus, 
  Flag, 
  Target,
  Copy,
  Scissors,
  RotateCcw
} from 'lucide-react'

interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  type: 'node' | 'edge' | 'canvas'
  onAction: (action: string) => void
  connectionMode?: boolean
  selectedNodeForConnection?: string | null
}

export function ReactFlowContextMenu({ 
  isOpen, 
  position, 
  onClose, 
  type, 
  onAction,
  connectionMode = false,
  selectedNodeForConnection = null
}: ContextMenuProps) {
  const getMenuItems = () => {
    switch (type) {
      case 'node':
        const nodeItems = [
          { id: 'add-self-loop', label: 'Add Self-Loop', icon: RotateCcw },
          { id: 'edit', label: 'Edit State', icon: Edit },
          { id: 'toggle-initial', label: 'Toggle Initial', icon: Flag },
          { id: 'toggle-final', label: 'Toggle Final', icon: Target },
          { id: 'copy', label: 'Copy State', icon: Copy },
          { id: 'delete', label: 'Delete State', icon: Trash2, variant: 'destructive' },
        ]
        
        // Add connection options if in connection mode
        if (connectionMode) {
          if (selectedNodeForConnection) {
            nodeItems.unshift({ 
              id: 'connect-to', 
              label: 'Connect From Selected', 
              icon: Target 
            })
          } else {
            nodeItems.unshift({ 
              id: 'connect-from', 
              label: 'Select for Connection', 
              icon: Plus 
            })
          }
        }
        
        return nodeItems
      case 'edge':
        return [
          { id: 'edit', label: 'Edit Transition', icon: Edit },
          { id: 'copy', label: 'Copy Transition', icon: Copy },
          { id: 'delete', label: 'Delete Transition', icon: Trash2, variant: 'destructive' },
        ]
      case 'canvas':
        return [
          { id: 'add-state', label: 'Add State', icon: Plus },
          { id: 'paste', label: 'Paste', icon: Scissors },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop to close menu */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {menuItems.map((item, index) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start px-3 py-2 h-auto text-sm font-normal rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 ${
                item.variant === 'destructive' 
                  ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => {
                onAction(item.id)
                onClose()
              }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
