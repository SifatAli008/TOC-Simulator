'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Check, AlertCircle } from 'lucide-react'

interface StateEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (state: { name: string; isInitial: boolean; isFinal: boolean }) => void
  initialState?: { name: string; isInitial: boolean; isFinal: boolean }
  existingStates: Array<{ name: string }>
}

export function StateEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  initialState,
  existingStates
}: StateEditorProps) {
  const [name, setName] = useState(initialState?.name || '')
  const [isInitial, setIsInitial] = useState(initialState?.isInitial || false)
  const [isFinal, setIsFinal] = useState(initialState?.isFinal || false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (initialState) {
      setName(initialState.name)
      setIsInitial(initialState.isInitial)
      setIsFinal(initialState.isFinal)
    }
  }, [initialState])

  const validateInput = () => {
    const newErrors: string[] = []
    
    if (!name.trim()) {
      newErrors.push('State name is required')
    } else if (name.trim().length > 10) {
      newErrors.push('State name must be 10 characters or less')
    } else if (!/^[a-zA-Z0-9_]+$/.test(name.trim())) {
      newErrors.push('State name can only contain letters, numbers, and underscores')
    } else if (existingStates.some(s => s.name.toLowerCase() === name.trim().toLowerCase())) {
      newErrors.push('State name already exists')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSave = () => {
    if (!validateInput()) return
    
    onSave({
      name: name.trim(),
      isInitial,
      isFinal
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const generateName = () => {
    const existingNames = existingStates.map(s => s.name.toLowerCase())
    let counter = 0
    let newName = `q${counter}`
    
    while (existingNames.includes(newName)) {
      counter++
      newName = `q${counter}`
    }
    
    setName(newName)
  }

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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {initialState ? 'Edit State' : 'Add State'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-red-700 dark:text-red-300 text-sm font-medium">Please fix the following errors:</p>
                      <ul className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* State Name */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="stateName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    State Name
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateName}
                    className="text-xs"
                  >
                    Generate
                  </Button>
                </div>
                <Input
                  id="stateName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter state name (e.g., q0, q1)..."
                  maxLength={10}
                  onKeyPress={handleKeyPress}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use letters, numbers, and underscores only
                </p>
              </div>

              {/* State Properties */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  State Properties
                </Label>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isInitial}
                      onChange={(e) => setIsInitial(e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Initial State</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isFinal}
                      onChange={(e) => setIsFinal(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Final State</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {name && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      isInitial && isFinal
                        ? 'bg-green-500 border-green-600 text-white'
                        : isInitial
                          ? 'bg-orange-500 border-orange-600 text-white'
                          : isFinal
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-blue-500 border-blue-600 text-white'
                    }`}>
                      {name || '?'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {isInitial && isFinal && 'Initial & Final State'}
                      {isInitial && !isFinal && 'Initial State'}
                      {!isInitial && isFinal && 'Final State'}
                      {!isInitial && !isFinal && 'Regular State'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                <Check className="h-4 w-4 mr-2" />
                {initialState ? 'Update' : 'Add'} State
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}





