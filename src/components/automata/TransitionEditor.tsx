'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Check, AlertCircle } from 'lucide-react'

interface TransitionEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transition: { from: string; to: string; symbol: string }) => void
  fromState?: string
  toState?: string
  availableStates: Array<{ id: string; name: string }>
  alphabet: string[]
  existingTransition?: { symbol: string }
}

export function TransitionEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  fromState: initialFromState,
  toState: initialToState,
  availableStates,
  alphabet,
  existingTransition
}: TransitionEditorProps) {
  const [fromState, setFromState] = useState(initialFromState || '')
  const [toState, setToState] = useState(initialToState || '')
  const [symbol, setSymbol] = useState(existingTransition?.symbol || '')
  const [customSymbol, setCustomSymbol] = useState('')
  const [useCustomSymbol, setUseCustomSymbol] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (existingTransition) {
      setSymbol(existingTransition.symbol)
      if (!alphabet.includes(existingTransition.symbol)) {
        setCustomSymbol(existingTransition.symbol)
        setUseCustomSymbol(true)
      }
    }
  }, [existingTransition, alphabet])

  const validateInput = () => {
    const newErrors: string[] = []
    
    if (!fromState) newErrors.push('Please select a source state')
    if (!toState) newErrors.push('Please select a target state')
    if (!symbol && !customSymbol) newErrors.push('Please enter a transition symbol')
    
    const finalSymbol = useCustomSymbol ? customSymbol : symbol
    if (finalSymbol && finalSymbol.length > 1) {
      newErrors.push('Transition symbol must be a single character')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSave = () => {
    if (!validateInput()) return
    
    const finalSymbol = useCustomSymbol ? customSymbol : symbol
    onSave({
      from: fromState,
      to: toState,
      symbol: finalSymbol
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
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
                {existingTransition ? 'Edit Transition' : 'Add Transition'}
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

              {/* From State */}
              <div>
                <Label htmlFor="fromState" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  From State
                </Label>
                <select
                  id="fromState"
                  value={fromState}
                  onChange={(e) => setFromState(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select source state...</option>
                  {availableStates.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* To State */}
              <div>
                <Label htmlFor="toState" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  To State
                </Label>
                <select
                  id="toState"
                  value={toState}
                  onChange={(e) => setToState(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select target state...</option>
                  {availableStates.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transition Symbol */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transition Symbol
                </Label>
                <div className="mt-1 space-y-2">
                  {/* Alphabet Symbols */}
                  {alphabet.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">From alphabet:</p>
                      <div className="flex flex-wrap gap-2">
                        {alphabet.map((char) => (
                          <button
                            key={char}
                            onClick={() => {
                              setSymbol(char)
                              setUseCustomSymbol(false)
                            }}
                            className={`px-3 py-1 rounded-md text-sm font-mono transition-colors ${
                              !useCustomSymbol && symbol === char
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                            }`}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Symbol */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="customSymbol"
                        checked={useCustomSymbol}
                        onChange={(e) => setUseCustomSymbol(e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <Label htmlFor="customSymbol" className="text-xs text-gray-600 dark:text-gray-400">
                        Use custom symbol
                      </Label>
                    </div>
                    
                    {useCustomSymbol && (
                      <Input
                        value={customSymbol}
                        onChange={(e) => setCustomSymbol(e.target.value)}
                        placeholder="Enter custom symbol..."
                        maxLength={1}
                        className="mt-2"
                        onKeyPress={handleKeyPress}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {(fromState || toState || symbol || customSymbol) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preview:</p>
                  <div className="flex items-center space-x-2 text-sm font-mono">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {availableStates.find(s => s.id === fromState)?.name || '?'}
                    </span>
                    <span>→</span>
                    <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                      {useCustomSymbol ? customSymbol : symbol || '?'}
                    </span>
                    <span>→</span>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      {availableStates.find(s => s.id === toState)?.name || '?'}
                    </span>
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
                {existingTransition ? 'Update' : 'Add'} Transition
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}





