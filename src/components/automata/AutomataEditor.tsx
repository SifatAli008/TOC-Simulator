'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { State, Transition, Automata } from '@/types/automata'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus, Play, Square, Command, Trash2, Edit, Flag } from 'lucide-react'
import { ContextMenu } from '@/components/ui/context-menu'
import { TransitionEditor } from './TransitionEditor'
import { StateEditor } from './StateEditor'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { AutomataFlow } from './AutomataFlow'

interface AutomataEditorProps {
  automata: Automata
  onAutomataChange: (automata: Automata) => void
  onSimulate: (input: string) => void
  isSimulating: boolean
}

export function AutomataEditor({ 
  automata, 
  onAutomataChange, 
  onSimulate, 
  isSimulating 
}: AutomataEditorProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [inputString, setInputString] = useState('')
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; target: 'state' | 'transition' | 'canvas'; id?: string }>({ isOpen: false, position: { x: 0, y: 0 }, target: 'canvas' })
  const [showTransitionEditor, setShowTransitionEditor] = useState(false)
  const [showStateEditor, setShowStateEditor] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [editingTransition, setEditingTransition] = useState<Transition | null>(null)
  const [editingState, setEditingState] = useState<State | null>(null)
  const [mode, setMode] = useState<'select' | 'addState' | 'addTransition'>('select')

  const addState = useCallback((x: number, y: number) => {
    const newState: State = {
      id: generateId(),
      name: `q${automata.states.length}`,
      x,
      y,
      isInitial: automata.states.length === 0,
      isFinal: false
    }
    
    onAutomataChange({
      ...automata,
      states: [...automata.states, newState]
    })
  }, [automata, onAutomataChange])


  const deleteState = useCallback((stateId: string) => {
    onAutomataChange({
      ...automata,
      states: automata.states.filter(s => s.id !== stateId),
      transitions: automata.transitions.filter(t => t.from !== stateId && t.to !== stateId)
    })
  }, [automata, onAutomataChange])

  const toggleStateProperty = useCallback((stateId: string, property: 'isInitial' | 'isFinal') => {
    onAutomataChange({
      ...automata,
      states: automata.states.map(s => 
        s.id === stateId 
          ? { ...s, [property]: !s[property] }
          : property === 'isInitial' 
            ? { ...s, isInitial: false }
            : s
      )
    })
  }, [automata, onAutomataChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return // Don't handle shortcuts when typing
      }

      switch (e.key.toLowerCase()) {
        case 'a':
          if (e.ctrlKey || e.metaKey) return
          setMode('addState')
          break
        case 't':
          if (e.ctrlKey || e.metaKey) return
          setMode('addTransition')
          break
        case 'escape':
          setMode('select')
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, target: 'canvas' })
          setShowTransitionEditor(false)
          setShowStateEditor(false)
          setShowKeyboardShortcuts(false)
          break
        case 'd':
          if (selectedState && !e.ctrlKey && !e.metaKey) {
            deleteState(selectedState)
          }
          break
        case 'i':
          if (selectedState && !e.ctrlKey && !e.metaKey) {
            toggleStateProperty(selectedState, 'isInitial')
          }
          break
        case 'f':
          if (selectedState && !e.ctrlKey && !e.metaKey) {
            toggleStateProperty(selectedState, 'isFinal')
          }
          break
        case 'enter':
          if (selectedState && !e.ctrlKey && !e.metaKey) {
            const state = automata.states.find(s => s.id === selectedState)
            if (state) {
              setEditingState(state)
              setShowStateEditor(true)
            }
          }
          break
        case ' ':
          e.preventDefault()
          if (!e.shiftKey) {
            onSimulate(inputString)
          }
          break
        case '/':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setShowKeyboardShortcuts(true)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedState, inputString, automata.states, onSimulate, deleteState, toggleStateProperty])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (mode === 'addState') {
        const rect = canvasRef.current!.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        addState(x, y)
        setMode('select')
      } else if (mode === 'addTransition') {
        setMode('select')
      }
    }
  }, [addState, mode])

  const handleCanvasRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      target: 'canvas'
    })
  }, [])

  const handleStateRightClick = useCallback((e: React.MouseEvent, stateId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      target: 'state',
      id: stateId
    })
  }, [])

  const handleStateDrag = useCallback((stateId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const state = automata.states.find(s => s.id === stateId)
    if (!state) return
    
    const rect = canvasRef.current!.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - state.x
    const offsetY = e.clientY - rect.top - state.y
    
    setDraggedState(stateId)
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      const newRect = canvasRef.current!.getBoundingClientRect()
      const x = Math.max(24, Math.min(newRect.width - 24, e.clientX - newRect.left - offsetX))
      const y = Math.max(24, Math.min(newRect.height - 24, e.clientY - newRect.top - offsetY))
      
      onAutomataChange({
        ...automata,
        states: automata.states.map(s => 
          s.id === stateId ? { ...s, x, y } : s
        )
      })
    }
    
    const handleMouseUp = () => {
      setDraggedState(null)
      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [automata, onAutomataChange])


  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
            <Button
              variant={mode === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('select')}
              className="rounded-r-none border-r border-gray-300 dark:border-gray-600"
            >
              <Square className="h-4 w-4 mr-2" />
              Select
            </Button>
            <Button
              variant={mode === 'addState' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('addState')}
              className="rounded-none border-r border-gray-300 dark:border-gray-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add State
            </Button>
            <Button
              variant={mode === 'addTransition' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('addTransition')}
              className="rounded-l-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transition
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeyboardShortcuts(true)}
          >
            <Command className="h-4 w-4 mr-2" />
            Shortcuts
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            placeholder="Enter input string..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <Button
            onClick={() => onSimulate(inputString)}
            disabled={isSimulating || !inputString}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Simulate
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {/* Mode indicator */}
        {mode !== 'select' && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                mode === 'addState' ? 'bg-blue-500' : 'bg-orange-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'addState' ? 'Click to add state' : 'Drag from state to create transition'}
              </span>
            </div>
          </div>
        )}

        <AutomataFlow
          automata={automata}
          onAutomataChange={onAutomataChange}
          selectedState={selectedState}
          onStateSelect={setSelectedState}
          onStateDoubleClick={(stateId) => {
            const state = automata.states.find(s => s.id === stateId)
            if (state) {
              setEditingState(state)
              setShowStateEditor(true)
            }
          }}
          className="w-full h-full"
        />
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, target: 'canvas' })}
        items={
          contextMenu.target === 'canvas' ? [
            {
              id: 'add-state',
              label: 'Add State',
              icon: Plus,
              action: () => setMode('addState')
            },
            {
              id: 'add-transition',
              label: 'Add Transition',
              icon: Plus,
              action: () => setMode('addTransition')
            }
          ] :
          contextMenu.target === 'state' && contextMenu.id ? [
            {
              id: 'edit-state',
              label: 'Edit State',
              icon: Edit,
              action: () => {
                const state = automata.states.find(s => s.id === contextMenu.id)
                if (state) {
                  setEditingState(state)
                  setShowStateEditor(true)
                }
              }
            },
            {
              id: 'toggle-initial',
              label: 'Toggle Initial State',
              icon: Flag,
              action: () => {
                if (contextMenu.id) {
                  toggleStateProperty(contextMenu.id, 'isInitial')
                }
              }
            },
            {
              id: 'toggle-final',
              label: 'Toggle Final State',
              icon: Flag,
              action: () => {
                if (contextMenu.id) {
                  toggleStateProperty(contextMenu.id, 'isFinal')
                }
              }
            },
            {
              id: 'delete-state',
              label: 'Delete State',
              icon: Trash2,
              action: () => {
                if (contextMenu.id) {
                  deleteState(contextMenu.id)
                }
              },
              variant: 'danger'
            }
          ] : []
        }
      />

      {/* Transition Editor */}
      <TransitionEditor
        isOpen={showTransitionEditor}
        onClose={() => {
          setShowTransitionEditor(false)
          setEditingTransition(null)
        }}
        onSave={(transition) => {
          if (editingTransition) {
            // Update existing transition
            onAutomataChange({
              ...automata,
              transitions: automata.transitions.map(t => 
                t.id === editingTransition.id ? { ...t, ...transition } : t
              )
            })
          } else {
            // Add new transition
            const newTransition: Transition = {
              id: generateId(),
              ...transition,
              label: transition.symbol
            }
            onAutomataChange({
              ...automata,
              transitions: [...automata.transitions, newTransition]
            })
          }
          setShowTransitionEditor(false)
          setEditingTransition(null)
        }}
        fromState={editingTransition?.from}
        toState={editingTransition?.to}
        availableStates={automata.states}
        alphabet={automata.alphabet}
        existingTransition={editingTransition ? { symbol: editingTransition.symbol } : undefined}
      />

      {/* State Editor */}
      <StateEditor
        isOpen={showStateEditor}
        onClose={() => {
          setShowStateEditor(false)
          setEditingState(null)
        }}
        onSave={(stateData) => {
          if (editingState) {
            // Update existing state
            onAutomataChange({
              ...automata,
              states: automata.states.map(s => 
                s.id === editingState.id ? { ...s, ...stateData } : s
              )
            })
          } else {
            // Add new state
            const newState: State = {
              id: generateId(),
              name: stateData.name,
              x: 100,
              y: 100,
              isInitial: stateData.isInitial,
              isFinal: stateData.isFinal
            }
            onAutomataChange({
              ...automata,
              states: [...automata.states, newState]
            })
          }
          setShowStateEditor(false)
          setEditingState(null)
        }}
        initialState={editingState ? {
          name: editingState.name,
          isInitial: editingState.isInitial,
          isFinal: editingState.isFinal
        } : undefined}
        existingStates={automata.states}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  )
}
