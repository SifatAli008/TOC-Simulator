'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { AutomataEditor } from '@/components/automata/AutomataEditor'
import { SimulationViewer } from '@/components/automata/SimulationViewer'
import { SimulationEngine } from '@/lib/simulation'
import { Automata, SimulationResult } from '@/types/automata'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Save, Download, Upload, Settings, AlertCircle } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AutomataValidator } from '@/lib/validation'
import { FirebaseAutomataService } from '@/lib/firebase-operations'

export default function SimulatorPage() {
  const [automata, setAutomata] = useState<Automata>({
    id: generateId(),
    name: 'New Automaton',
    type: 'DFA',
    states: [],
    transitions: [],
    alphabet: ['a', 'b'],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'simulation'>('editor')
  const [validationResult, setValidationResult] = useState<ReturnType<typeof AutomataValidator.validateAutomata> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAutomataChange = useCallback((newAutomata: Automata) => {
    setAutomata({
      ...newAutomata,
      updatedAt: new Date()
    })
    
    // Validate automata on change
    const validation = AutomataValidator.validateAutomata(newAutomata)
    setValidationResult(validation)
  }, [])

  // Memoize validation result
  const validationErrors = useMemo(() => {
    return validationResult?.errors || []
  }, [validationResult])

  const validationWarnings = useMemo(() => {
    return validationResult?.warnings || []
  }, [validationResult])

  const handleSimulate = async (input: string) => {
    if (!input) return

    setIsSimulating(true)
    setCurrentStep(0)
    
    try {
      const engine = new SimulationEngine(automata)
      const result = engine.simulate(input)
      setSimulationResult(result)
      setActiveTab('simulation')
    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleSave = async () => {
    if (!validationResult?.isValid) {
      setError('Cannot save invalid automaton. Please fix validation errors first.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const savedId = await FirebaseAutomataService.saveAutomata(
        automata,
        'anonymous', // TODO: Get from auth
        automata.name,
        `Automaton of type ${automata.type}`,
        [automata.type.toLowerCase()],
        false
      )
      
      console.log('Automaton saved with ID:', savedId)
      // TODO: Show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save automaton')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    // TODO: Implement load dialog
    console.log('Loading automata')
    setError('Load functionality coming soon!')
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(automata, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${automata.name.toLowerCase().replace(/\s+/g, '-')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-b border-red-200">
            <div className="px-6 py-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="px-6 py-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-yellow-700 text-sm font-medium">Warnings:</p>
                  <ul className="text-yellow-600 text-sm mt-1">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-b border-red-200">
            <div className="px-6 py-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm font-medium">Errors:</p>
                  <ul className="text-red-600 text-sm mt-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {automata.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {automata.type} • {automata.states.length} states • {automata.transitions.length} transitions
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoad}
              >
                <Upload className="h-4 w-4 mr-2" />
                Load
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isLoading || !validationResult?.isValid}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('editor')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'editor'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'simulation'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Editor Panel */}
        {activeTab === 'editor' && (
          <div className="flex-1">
            <AutomataEditor
              automata={automata}
              onAutomataChange={handleAutomataChange}
              onSimulate={handleSimulate}
              isSimulating={isSimulating}
            />
          </div>
        )}

        {/* Simulation Panel */}
        {activeTab === 'simulation' && (
          <div className="flex-1">
            <SimulationViewer
              result={simulationResult}
              onStepChange={handleStepChange}
              currentStep={currentStep}
            />
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}
