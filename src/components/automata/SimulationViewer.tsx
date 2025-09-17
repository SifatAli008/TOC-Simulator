'use client'

import React, { useState, useEffect } from 'react'
import { SimulationResult } from '@/types/automata'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

interface SimulationViewerProps {
  result: SimulationResult | null
  onStepChange: (step: number) => void
  currentStep: number
}

export function SimulationViewer({ result, onStepChange, currentStep }: SimulationViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // milliseconds

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying && result) {
      interval = setInterval(() => {
        if (currentStep < result.steps.length - 1) {
          onStepChange(currentStep + 1)
        } else {
          setIsPlaying(false)
        }
      }, playbackSpeed)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentStep, result, onStepChange, playbackSpeed])

  const handlePlay = () => {
    if (currentStep >= (result?.steps.length || 1) - 1) {
      onStepChange(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    onStepChange(0)
  }

  const handleStepBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const handleStepForward = () => {
    if (result && currentStep < result.steps.length - 1) {
      onStepChange(currentStep + 1)
    }
  }

  if (!result) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No simulation to display. Enter an input string and click Simulate.</p>
      </div>
    )
  }

  const currentStepData = result.steps[currentStep]
  const progress = result.steps.length > 0 ? (currentStep / (result.steps.length - 1)) * 100 : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Simulation Result
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              result.isAccepted 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {result.isAccepted ? 'Accepted' : 'Rejected'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {result.executionTime.toFixed(2)}ms
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={currentStep === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStepBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStepForward}
              disabled={currentStep >= result.steps.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value={500}>2x</option>
              <option value={1000}>1x</option>
              <option value={2000}>0.5x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Step</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-300">Step:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-white">
                  {currentStepData.step}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">State:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-white">
                  {currentStepData.currentState}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Remaining Input:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-white">
                  {currentStepData.remainingInput || 'ε'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Status:</span>
                <span className={`ml-2 font-medium ${
                  currentStepData.isAccepted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {currentStepData.isAccepted ? 'Accepted' : 'Processing'}
                </span>
              </div>
            </div>
          </div>

          {currentStepData.transition && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Transition</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-mono">{currentStepData.transition.from}</span>
                <span className="mx-2">→</span>
                <span className="font-mono">{currentStepData.transition.to}</span>
                <span className="mx-2">on</span>
                <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  &apos;{currentStepData.transition.symbol}&apos;
                </span>
              </div>
            </div>
          )}

          {/* All Steps */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">All Steps</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {result.steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    index === currentStep
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => onStepChange(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                        {step.step}
                      </span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {step.currentState}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {step.remainingInput || 'ε'}
                      </span>
                    </div>
                    {step.isAccepted && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                        Accepted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
