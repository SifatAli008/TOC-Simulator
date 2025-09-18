'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  FileText, 
  Wand2, 
  CheckCircle, 
  TestTube, 
  Play, 
  Plus, 
  X, 
  AlertCircle 
} from 'lucide-react'
import { Automata, Transition, State } from '@/types/automata'
import { generateId } from '@/lib/utils'

interface ProblemSolverProps {
  automata: Automata
  onAutomataChange: (automata: Automata) => void
  className?: string
}

export function ProblemSolver({ automata, onAutomataChange, className = '' }: ProblemSolverProps) {
  const [showProblemInput, setShowProblemInput] = useState(false)
  const [problemDescription, setProblemDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [testStrings, setTestStrings] = useState<string[]>([''])
  const [testResults, setTestResults] = useState<{string: string, accepted: boolean, path: string[]}[]>([])
  const [validationResult, setValidationResult] = useState<{isValid: boolean, message: string, score: string} | null>(null)

  const generateDFAFromDescription = useCallback(async (description: string) => {
    setIsGenerating(true)
    setValidationResult(null)
    
    try {
      // Simple example DFA generation for demonstration
      const newState: State = {
        id: generateId(),
        name: 'q0',
        x: 200,
        y: 200,
        isInitial: true,
        isFinal: true,
      }
      
      const newAutomata: Automata = {
        id: generateId(),
        name: `Generated from: ${description.slice(0, 30)}...`,
        type: 'DFA',
        states: [newState],
        transitions: [],
        alphabet: ['a', 'b'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      onAutomataChange(newAutomata)
      
    } catch (error) {
      console.error('Error generating DFA:', error)
      setValidationResult({
        isValid: false,
        message: error instanceof Error ? error.message : 'Failed to generate DFA',
        score: '0/0'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [onAutomataChange])

  const testAllStrings = useCallback(() => {
    const results = testStrings.map(testString => {
      // Simple simulation for demonstration
      return {
        string: testString,
        accepted: testString.length % 2 === 0, // Example: accept even length strings
        path: ['q0']
      }
    })
    setTestResults(results)
  }, [testStrings])

  return (
    <div className={`absolute bottom-4 right-4 z-10 w-96 max-h-[calc(100vh-150px)] overflow-hidden bg-gradient-to-br from-white/98 to-blue-50/95 dark:from-gray-800/98 dark:to-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-blue-200/50 dark:border-blue-800/50 ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">🤖 AI Problem Solver</h3>
              <p className="text-xs text-blue-100">Generate DFAs from natural language</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProblemInput(!showProblemInput)}
            className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            {showProblemInput ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {showProblemInput && (
        <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Problem Description Input */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Describe Your Problem
              </label>
            </div>
            
            <div className="relative">
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Try: 'strings of length 3', 'strings ending with 01', 'even number of 0s', 'palindromes'..."
                className="w-full px-4 py-3 text-sm border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm"
                rows={3}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {problemDescription.length}/200
              </div>
            </div>
            
            {/* Enhanced Feature Tags */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-2 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">✨ Basic Patterns</div>
                <div className="text-xs text-green-600 dark:text-green-400">Length • Position • Counting</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-xs font-medium text-purple-800 dark:text-purple-300 mb-1">🚀 Advanced</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Logic • Palindromes • Primes</div>
              </div>
            </div>
              
            {/* Quick Examples */}
            {!problemDescription && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">💡 Quick Examples:</div>
                <div className="grid gap-1">
                  {[
                    'strings of length 3',
                    'strings ending with 01', 
                    'even number of 0s',
                    'palindromes'
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setProblemDescription(example)}
                      className="text-left px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors duration-150 text-gray-700 dark:text-gray-300"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => generateDFAFromDescription(problemDescription)}
              disabled={!problemDescription.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium h-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  ✨ Generate DFA
                </>
              )}
            </Button>
            
            <Button
              onClick={() => {/* Add validation logic */}}
              disabled={!problemDescription.trim() || automata.states.length === 0}
              variant="outline"
              className="w-full border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 font-medium h-9 rounded-lg transition-all duration-200"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              🎯 Validate Solution
            </Button>
              
            {problemDescription.trim() && (
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
                💡 Click "Generate DFA" to automatically create an automaton for your problem
              </div>
            )}
          </div>
          
          {/* Enhanced Validation Result */}
          {validationResult && (
            <div className={`relative overflow-hidden rounded-xl border-2 ${
              validationResult.isValid 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-700' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-300 dark:border-yellow-700'
            }`}>
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    validationResult.isValid 
                      ? 'bg-green-100 dark:bg-green-900/50' 
                      : 'bg-yellow-100 dark:bg-yellow-900/50'
                  }`}>
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-1 ${
                      validationResult.isValid 
                        ? 'text-green-800 dark:text-green-300' 
                        : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {validationResult.isValid ? '🎉 Perfect Solution!' : '⚠️ Needs Improvement'}
                    </h4>
                    <p className={`text-sm mb-2 ${
                      validationResult.isValid 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {validationResult.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        validationResult.isValid 
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' 
                          : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        Score: {validationResult.score}
                      </div>
                      {validationResult.isValid && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✨ Ready to use!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Animated background effect for success */}
              {validationResult.isValid && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse"></div>
              )}
            </div>
          )}
          
          {/* Enhanced Interactive Testing Section */}
          <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded">
                  <TestTube className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Test Your DFA
                </h4>
              </div>
              <Button
                onClick={testAllStrings}
                disabled={automata.states.length === 0}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3 rounded-lg shadow-sm transition-all duration-200"
              >
                <Play className="h-3 w-3 mr-1" />
                Test All
              </Button>
            </div>
            
            {/* Enhanced Test String Inputs */}
            <div className="space-y-2 mb-3">
              {testStrings.slice(0, 3).map((testString, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={testString}
                      onChange={(e) => {
                        const newTestStrings = [...testStrings]
                        newTestStrings[index] = e.target.value
                        setTestStrings(newTestStrings)
                      }}
                      placeholder={index === 0 ? "e.g., '01', '10', 'ε' (empty)" : "Test string"}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-mono"
                    />
                    {testString === '' && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        ε
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      if (testStrings.length > 1) {
                        setTestStrings(testStrings.filter((_, i) => i !== index))
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 w-8 p-0 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {testStrings.length < 5 && (
                <Button
                  onClick={() => setTestStrings([...testStrings, ''])}
                  variant="outline"
                  className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 h-9 rounded-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test String
                </Button>
              )}
            </div>
            
            {/* Enhanced Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-1"></div>
                  <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Test Results</h5>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-1"></div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {testResults.slice(0, 4).map((result, index) => (
                    <div key={index} className={`relative overflow-hidden rounded-lg border-2 p-3 transition-all duration-300 hover:shadow-md ${
                      result.accepted 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-700'
                        : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-300 dark:border-red-700'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                            result.accepted ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {result.accepted ? '✓' : '✗'}
                          </div>
                          <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                            "{result.string || 'ε'}"
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          result.accepted 
                            ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                            : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                        }`}>
                          {result.accepted ? 'ACCEPTED' : 'REJECTED'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Path:</span>
                        <span className="ml-1 font-mono">
                          {result.path.slice(0, 6).join(' → ')}
                          {result.path.length > 6 && ' → ...'}
                        </span>
                      </div>
                      
                      {/* Animated success indicator */}
                      {result.accepted && (
                        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-green-400 to-emerald-500 opacity-50"></div>
                      )}
                    </div>
                  ))}
                  {testResults.length > 4 && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        <span>+{testResults.length - 4} more results</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

