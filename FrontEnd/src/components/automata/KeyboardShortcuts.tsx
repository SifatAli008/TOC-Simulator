'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, X, Plus, Trash2, Save, Upload, Play, Square, Edit } from 'lucide-react'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: ['Ctrl', 'S'], action: 'Save automaton', icon: Save },
      { keys: ['Ctrl', 'O'], action: 'Load automaton', icon: Upload },
      { keys: ['Ctrl', 'N'], action: 'New automaton', icon: Plus },
      { keys: ['Ctrl', 'Z'], action: 'Undo', icon: Edit },
      { keys: ['Ctrl', 'Y'], action: 'Redo', icon: Edit },
      { keys: ['Delete'], action: 'Delete selected', icon: Trash2 },
      { keys: ['Escape'], action: 'Cancel operation', icon: X },
    ]
  },
  {
    category: 'States',
    items: [
      { keys: ['A'], action: 'Add state mode', icon: Plus },
      { keys: ['D'], action: 'Delete state', icon: Trash2 },
      { keys: ['I'], action: 'Toggle initial state', icon: Play },
      { keys: ['F'], action: 'Toggle final state', icon: Square },
      { keys: ['Enter'], action: 'Edit state properties', icon: Edit },
    ]
  },
  {
    category: 'Transitions',
    items: [
      { keys: ['T'], action: 'Add transition mode', icon: Plus },
      { keys: ['Ctrl', 'T'], action: 'Delete transition', icon: Trash2 },
      { keys: ['Space'], action: 'Run simulation', icon: Play },
      { keys: ['Shift', 'Space'], action: 'Step simulation', icon: Play },
    ]
  },
  {
    category: 'View',
    items: [
      { keys: ['Ctrl', '+'], action: 'Zoom in', icon: Plus },
      { keys: ['Ctrl', '-'], action: 'Zoom out', icon: Plus },
      { keys: ['R'], action: 'Reset view', icon: Square },
    ]
  }
]

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const filteredShortcuts = shortcuts.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.action.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Command className="h-5 w-5" />
                      <span>Keyboard Shortcuts</span>
                    </CardTitle>
                    <CardDescription>
                      Use these shortcuts to work more efficiently
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {filteredShortcuts.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <shortcut.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {shortcut.action}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600">
                                    {key}
                                  </kbd>
                                  {keyIndex < shortcut.keys.length - 1 && (
                                    <span className="text-gray-400">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {filteredShortcuts.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No shortcuts found matching &quot;{searchTerm}&quot;
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


