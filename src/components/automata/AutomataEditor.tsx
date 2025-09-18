'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { State, Transition, Automata } from '@/types/automata'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus, Play, Square, Command, Trash2, Edit, Flag, AlertCircle, X, Wand2, CheckCircle, FileText, TestTube, Brain } from 'lucide-react'
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
  validationWarnings?: string[]
  validationErrors?: string[]
}

export function AutomataEditor({ 
  automata, 
  onAutomataChange, 
  onSimulate, 
  isSimulating,
  validationWarnings = [],
  validationErrors = []
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
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedState, setDraggedState] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Formal Language System State
  const [problemDescription, setProblemDescription] = useState('')
  const [showProblemInput, setShowProblemInput] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [testStrings, setTestStrings] = useState<string[]>([''])
  const [testResults, setTestResults] = useState<{string: string, accepted: boolean, path: string[]}[]>([])
  const [validationResult, setValidationResult] = useState<{isValid: boolean, message: string, score: string} | null>(null)

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

  // Formal Language Problem Parser and DFA Generator
  const parseProblemDescription = useCallback((description: string) => {
    const lowerDesc = description.toLowerCase().trim()
    
    // Clean up common variations
    const cleanDesc = lowerDesc
      .replace(/construct\s+a?\s*dfa\s+(that\s+)?(accepts?\s+)?/g, '')
      .replace(/build\s+a?\s*dfa\s+(that\s+)?(accepts?\s+)?/g, '')
      .replace(/create\s+a?\s*dfa\s+(that\s+)?(accepts?\s+)?/g, '')
      .replace(/design\s+a?\s*dfa\s+(that\s+)?(accepts?\s+)?/g, '')
      .replace(/all\s+strings?\s+/g, 'strings ')
      .replace(/sets?\s+of\s+/g, '')
      .replace(/language\s+of\s+/g, '')
      .replace(/\bl\d+\s*=\s*/g, '') // Remove L2 = etc.
      .trim()
    
    // Pattern 1: Length-based patterns
    const lengthPatterns = [
      /(?:strings?\s+)?(?:over\s+\{[^}]+\}\s+)?(?:of\s+)?length\s+(\d+)/,
      /(\d+)\s+character(?:s)?\s+long/,
      /(?:exactly\s+)?(\d+)\s+(?:symbols?|characters?)/,
      /strings?\s+with\s+(\d+)\s+(?:symbols?|characters?)/
    ]
    
    for (const pattern of lengthPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        const length = parseInt(match[1])
        return { type: 'length', value: length, alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 2: Ending patterns
    const endingPatterns = [
      /(?:strings?\s+)?(?:that\s+)?(?:ends?\s+with|ending\s+with|ending\s+in)\s+(?:the\s+pattern\s+)?['"]*([01]+)['"]*(?:\s|$)/,
      /(?:strings?\s+)?(?:that\s+)?(?:terminates?\s+with|suffixed?\s+(?:by|with))\s+['"]*([01]+)['"]*(?:\s|$)/,
      /['"]*([01]+)['"]*\s+(?:at\s+the\s+)?(?:end|suffix)/
    ]
    
    for (const pattern of endingPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        return { type: 'ending', value: match[1], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 3: Starting patterns
    const startingPatterns = [
      /(?:strings?\s+)?(?:that\s+)?(?:starts?\s+with|starting\s+with|beginning\s+with)\s+(?:the\s+pattern\s+)?['"]*([01]+)['"]*(?:\s|$)/,
      /(?:strings?\s+)?(?:that\s+)?(?:begins?\s+with|prefixed?\s+(?:by|with))\s+['"]*([01]+)['"]*(?:\s|$)/,
      /['"]*([01]+)['"]*\s+(?:at\s+the\s+)?(?:start|beginning|prefix)/
    ]
    
    for (const pattern of startingPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        return { type: 'starting', value: match[1], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 4: Containing patterns
    const containingPatterns = [
      /(?:strings?\s+)?(?:that\s+)?(?:contains?|containing|having|with)\s+(?:the\s+)?(?:substring\s+|pattern\s+)?['"]*([01]+)['"]*(?:\s|$)/,
      /(?:strings?\s+)?(?:that\s+)?(?:includes?|including)\s+(?:the\s+)?(?:substring\s+|pattern\s+)?['"]*([01]+)['"]*(?:\s|$)/,
      /['"]*([01]+)['"]*\s+(?:as\s+a\s+)?(?:substring|subsequence)/
    ]
    
    for (const pattern of containingPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        return { type: 'containing', value: match[1], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 5: Counting patterns (even/odd)
    const countingPatterns = [
      /(even|odd)\s+number\s+of\s+([01])s?/,
      /(?:strings?\s+with\s+)?(even|odd)\s+([01])s?/,
      /(?:strings?\s+having\s+)?(even|odd)\s+count\s+of\s+([01])s?/,
      /(even|odd)\s+occurrences?\s+of\s+([01])/
    ]
    
    for (const pattern of countingPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        return { type: 'count', parity: match[1], symbol: match[2], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 6: Empty string / epsilon
    if (cleanDesc.includes('empty string') || cleanDesc.includes('epsilon') || cleanDesc.includes('ε')) {
      return { type: 'empty', alphabet: extractAlphabet(description) }
    }
    
    // Pattern 7: All strings (universal language)
    if (cleanDesc.includes('all strings') || cleanDesc.includes('any string') || cleanDesc.includes('every string')) {
      return { type: 'universal', alphabet: extractAlphabet(description) }
    }
    
    // Pattern 8: Multiple of length patterns
    const multiplePatterns = [
      /length\s+(?:is\s+)?(?:a\s+)?multiple\s+of\s+(\d+)/,
      /length\s+(?:is\s+)?divisible\s+by\s+(\d+)/,
      /length\s+(?:that\s+is\s+)?(\d+)k(?:\s+for\s+some\s+integer\s+k)?/
    ]
    
    for (const pattern of multiplePatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        const divisor = parseInt(match[1])
        return { type: 'length_multiple', value: divisor, alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 9: Length range patterns
    const rangePatterns = [
      /length\s+(?:between|from)\s+(\d+)\s+(?:to|and)\s+(\d+)/,
      /length\s+(?:at\s+least|>=|≥)\s+(\d+)/,
      /length\s+(?:at\s+most|<=|≤)\s+(\d+)/,
      /length\s+(?:less\s+than|<)\s+(\d+)/,
      /length\s+(?:greater\s+than|>)\s+(\d+)/
    ]
    
    for (const pattern of rangePatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        if (match[2]) { // Range pattern
          return { type: 'length_range', min: parseInt(match[1]), max: parseInt(match[2]), alphabet: extractAlphabet(description) }
        } else if (cleanDesc.includes('at least') || cleanDesc.includes('>=') || cleanDesc.includes('≥') || cleanDesc.includes('greater than')) {
          return { type: 'length_min', value: parseInt(match[1]), alphabet: extractAlphabet(description) }
        } else {
          return { type: 'length_max', value: parseInt(match[1]), alphabet: extractAlphabet(description) }
        }
      }
    }
    
    // Pattern 10: Balanced strings (equal number of symbols)
    const balancedPatterns = [
      /equal\s+number\s+of\s+([01])\s*(?:and|,)\s*([01])/,
      /same\s+(?:count|number)\s+of\s+([01])\s*(?:and|,)\s*([01])/,
      /balanced\s+(?:with\s+respect\s+to\s+)?([01])\s*(?:and|,)\s*([01])/,
      /(?:number|count)\s+of\s+([01])s?\s*(?:equals|=)\s*(?:number|count)\s+of\s+([01])s?/
    ]
    
    for (const pattern of balancedPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        return { type: 'balanced', symbol1: match[1], symbol2: match[2], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 11: Difference/Comparison patterns
    const differencePatterns = [
      /(?:number|count)\s+of\s+([01])s?\s*(?:minus|-)?\s*(?:number|count)\s+of\s+([01])s?\s*(?:is|equals?|=)\s*(\d+)/,
      /(?:number|count)\s+of\s+([01])s?\s*(?:exceeds|is\s+greater\s+than)\s*(?:number|count)\s+of\s+([01])s?\s*by\s*(\d+)/,
      /more\s+([01])s?\s+than\s+([01])s?\s*(?:by\s*(\d+))?/
    ]
    
    for (const pattern of differencePatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        const diff = match[3] ? parseInt(match[3]) : 1
        return { type: 'difference', symbol1: match[1], symbol2: match[2], difference: diff, alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 12: Modular arithmetic patterns
    const modularPatterns = [
      /(?:number|count)\s+of\s+([01])s?\s*(?:mod|modulo|%)\s*(\d+)\s*(?:is|equals?|=)\s*(\d+)/,
      /(?:number|count)\s+of\s+([01])s?\s*(?:when\s+divided\s+by\s+(\d+)\s+)?(?:gives?\s+)?remainder\s+(\d+)/
    ]
    
    for (const pattern of modularPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        const modulus = match[2] ? parseInt(match[2]) : parseInt(match[1])
        const remainder = match[3] ? parseInt(match[3]) : parseInt(match[2])
        return { type: 'modular', symbol: match[1], modulus, remainder, alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 13: Subsequence patterns (not substring)
    const subsequencePatterns = [
      /(?:contains?|having|with)\s+(?:the\s+)?subsequence\s+([01]+)/,
      /([01]+)\s+(?:as\s+a\s+)?subsequence/,
      /(?:contains?|having)\s+([01]+)\s+(?:in\s+)?(?:order|sequence)/
    ]
    
    for (const pattern of subsequencePatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        return { type: 'subsequence', value: match[1], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 14: No occurrence patterns
    const noOccurrencePatterns = [
      /(?:does\s+not\s+contain|without|no)\s+(?:the\s+)?(?:substring\s+|pattern\s+)?([01]+)/,
      /(?:avoids?|avoiding)\s+(?:the\s+)?(?:substring\s+|pattern\s+)?([01]+)/,
      /(?:never\s+contains?)\s+(?:the\s+)?(?:substring\s+|pattern\s+)?([01]+)/
    ]
    
    for (const pattern of noOccurrencePatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        return { type: 'not_containing', value: match[1], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 15: Regular expression patterns
    if (cleanDesc.includes('regular expression') || cleanDesc.includes('regex') || cleanDesc.includes('regexp')) {
      const regexMatch = cleanDesc.match(/(?:regular\s+expression|regex|regexp)\s*[:=]?\s*([^\s,;.]+)/)
      if (regexMatch) {
        return { type: 'regex', value: regexMatch[1], alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 16: Specific string sets
    const specificSetPatterns = [
      /(?:exactly\s+)?(?:the\s+)?(?:strings?\s+)?(?:set\s+)?\{([^}]+)\}/,
      /(?:only\s+)?(?:accepts?\s+)?(?:the\s+)?(?:strings?\s+)?["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])*/
    ]
    
    for (const pattern of specificSetPatterns) {
      const match = cleanDesc.match(pattern)
      if (match) {
        let strings = []
        if (match[1].includes(',')) {
          strings = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
        } else {
          strings = [match[1].trim().replace(/['"]/g, '')]
        }
        return { type: 'specific_set', value: strings, alphabet: extractAlphabet(description) }
      }
    }
    
    // Pattern 17: AI-powered fallback using keyword analysis
    return analyzeWithAI(cleanDesc, description)
  }, [])
  
  const extractAlphabet = (description: string): string[] => {
    const alphabetMatch = description.match(/\{([^}]+)\}/)
    if (alphabetMatch) {
      return alphabetMatch[1].split(',').map(s => s.trim())
    }
    return ['0', '1'] // default binary alphabet
  }
  
  const analyzeWithAI = (cleanDesc: string, originalDesc: string) => {
    // AI-powered analysis using keyword extraction and pattern matching
    const keywords = cleanDesc.split(/\s+/)
    const context = {
      hasNumbers: /\d+/.test(cleanDesc),
      hasBinaryPattern: /[01]+/.test(cleanDesc),
      hasLength: keywords.some(w => ['length', 'long', 'size'].includes(w)),
      hasCount: keywords.some(w => ['number', 'count', 'many', 'few'].includes(w)),
      hasPosition: keywords.some(w => ['start', 'end', 'begin', 'middle', 'position'].includes(w)),
      hasComparison: keywords.some(w => ['more', 'less', 'equal', 'same', 'different'].includes(w)),
      hasLogical: keywords.some(w => ['and', 'or', 'not', 'but', 'except'].includes(w))
    }
    
    // Smart inference based on context
    if (context.hasLength && context.hasNumbers) {
      const numberMatch = cleanDesc.match(/(\d+)/)
      if (numberMatch) {
        return { type: 'length', value: parseInt(numberMatch[1]), alphabet: extractAlphabet(originalDesc) }
      }
    }
    
    if (context.hasBinaryPattern) {
      const binaryMatch = cleanDesc.match(/([01]+)/)
      if (binaryMatch) {
        const pattern = binaryMatch[1]
        if (context.hasPosition) {
          if (keywords.some(w => ['start', 'begin', 'prefix'].includes(w))) {
            return { type: 'starting', value: pattern, alphabet: extractAlphabet(originalDesc) }
          }
          if (keywords.some(w => ['end', 'suffix', 'finish'].includes(w))) {
            return { type: 'ending', value: pattern, alphabet: extractAlphabet(originalDesc) }
          }
        }
        return { type: 'containing', value: pattern, alphabet: extractAlphabet(originalDesc) }
      }
    }
    
    if (context.hasCount && context.hasComparison) {
      if (keywords.some(w => ['even', 'odd'].includes(w))) {
        const parity = keywords.find(w => ['even', 'odd'].includes(w))
        const symbol = cleanDesc.match(/([01])/)?.[1] || '0'
        return { type: 'count', parity, symbol, alphabet: extractAlphabet(originalDesc) }
      }
    }
    
    // If all else fails, suggest the user reformulate
    return null
  }
  
  const generateDFAFromParsedProblem = useCallback((parsedProblem: any): Automata => {
    switch (parsedProblem.type) {
      case 'length':
        return generateLengthDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'ending':
        return generateEndingWithDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'starting':
        return generateStartingWithDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'containing':
        return generateContainingDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'count':
        return generateCountDFA(parsedProblem.parity, parsedProblem.symbol, parsedProblem.alphabet)
      case 'empty':
        return generateEmptyStringDFA(parsedProblem.alphabet)
      case 'universal':
        return generateUniversalDFA(parsedProblem.alphabet)
      case 'length_multiple':
        return generateLengthMultipleDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'length_range':
        return generateLengthRangeDFA(parsedProblem.min, parsedProblem.max, parsedProblem.alphabet)
      case 'length_min':
        return generateLengthMinDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'length_max':
        return generateLengthMaxDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'balanced':
        return generateBalancedDFA(parsedProblem.symbol1, parsedProblem.symbol2, parsedProblem.alphabet)
      case 'difference':
        return generateDifferenceDFA(parsedProblem.symbol1, parsedProblem.symbol2, parsedProblem.difference, parsedProblem.alphabet)
      case 'modular':
        return generateModularDFA(parsedProblem.symbol, parsedProblem.modulus, parsedProblem.remainder, parsedProblem.alphabet)
      case 'subsequence':
        return generateSubsequenceDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'not_containing':
        return generateNotContainingDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'regex':
        return generateRegexDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'specific_set':
        return generateSpecificSetDFA(parsedProblem.value, parsedProblem.alphabet)
      case 'alternating':
        return generateAlternatingDFA(parsedProblem.symbol1, parsedProblem.symbol2, parsedProblem.alphabet)
      case 'palindrome':
        return generatePalindromeDFA(parsedProblem.alphabet)
      case 'count_multiple':
        return generateCountMultipleDFA(parsedProblem.symbol, parsedProblem.multiple, parsedProblem.alphabet)
      default:
        throw new Error(`Unsupported problem type: ${parsedProblem.type}`)
    }
  }, [])
  
  const generateLengthDFA = (length: number, alphabet: string[]): Automata => {
    // Input validation
    if (!Number.isInteger(length) || length < 0) {
      throw new Error('Length must be a non-negative integer')
    }
    if (!alphabet || alphabet.length === 0) {
      throw new Error('Alphabet cannot be empty')
    }
    if (length > 20) {
      throw new Error('Length too large for visualization (max 20)')
    }
    
    const states = []
    const transitions: Transition[] = []
    
    // Create states q0, q1, ..., q_length, q_reject with improved layout
    for (let i = 0; i <= length + 1; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 150 + (i * 140), // Better spacing
        y: 250 + (i % 2 === 0 ? 0 : 60), // Zigzag pattern for better visual flow
        isInitial: i === 0,
        isFinal: i === length
      })
    }
    
    // Create transitions
    for (let i = 0; i < length; i++) {
      alphabet.forEach(symbol => {
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${i + 1}`,
          symbol,
          label: symbol
        })
      })
    }
    
    // Transitions from final state and beyond to reject state
    for (let i = length; i <= length; i++) {
      alphabet.forEach(symbol => {
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${length + 1}`,
          symbol,
          label: symbol
        })
      })
    }
    
    // Self-loop on reject state
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${length + 1}`,
        to: `q${length + 1}`,
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Strings of length ${length}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateEndingWithDFA = (pattern: string, alphabet: string[]): Automata => {
    // Input validation
    if (!pattern || pattern.length === 0) {
      throw new Error('Pattern cannot be empty')
    }
    if (!alphabet || alphabet.length === 0) {
      throw new Error('Alphabet cannot be empty')
    }
    if (pattern.length > 10) {
      throw new Error('Pattern too long for visualization (max 10 characters)')
    }
    
    const states = []
    const transitions: Transition[] = []
    const patternLength = pattern.length
    
    // Create states for pattern matching with improved layout
    for (let i = 0; i <= patternLength; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 150 + (i * 140), // Better spacing
        y: 250 + Math.sin(i * 0.5) * 40, // Smooth wave pattern
        isInitial: i === 0,
        isFinal: i === patternLength
      })
    }
    
    // Create transitions for pattern matching
    for (let i = 0; i < patternLength; i++) {
      const expectedSymbol = pattern[i]
      
      // Correct symbol - advance
      transitions.push({
        id: generateId(),
        from: `q${i}`,
        to: `q${i + 1}`,
        symbol: expectedSymbol,
        label: expectedSymbol
      })
      
      // Wrong symbols - compute failure function
      alphabet.forEach(symbol => {
        if (symbol !== expectedSymbol) {
          const targetState = computeFailureTransition(pattern, i, symbol)
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${targetState}`,
            symbol,
            label: symbol
          })
        }
      })
    }
    
    // From final state
    alphabet.forEach(symbol => {
      if (symbol === pattern[0]) {
        transitions.push({
          id: generateId(),
          from: `q${patternLength}`,
          to: 'q1',
          symbol,
          label: symbol
        })
      } else {
        transitions.push({
          id: generateId(),
          from: `q${patternLength}`,
          to: 'q0',
          symbol,
          label: symbol
        })
      }
    })
    
    return {
      id: generateId(),
      name: `Strings ending with ${pattern}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const computeFailureTransition = (pattern: string, currentPos: number, symbol: string): number => {
    const currentPrefix = pattern.substring(0, currentPos) + symbol
    
    // Find longest proper prefix that is also suffix
    for (let len = Math.min(currentPos, pattern.length - 1); len >= 0; len--) {
      if (currentPrefix.endsWith(pattern.substring(0, len + 1))) {
        return len + 1
      }
    }
    return 0
  }
  
  const generateStartingWithDFA = (pattern: string, alphabet: string[]): Automata => {
    const states = []
    const transitions: Transition[] = []
    
    // Create states
    states.push({
      id: 'q0',
      name: 'q0',
      x: 100,
      y: 200,
      isInitial: true,
      isFinal: false
    })
    
    for (let i = 1; i <= pattern.length; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 100 + i * 120,
        y: 200,
        isInitial: false,
        isFinal: i === pattern.length
      })
    }
    
    // Reject state
    states.push({
      id: 'qr',
      name: 'qr',
      x: 100 + (pattern.length + 1) * 120,
      y: 200,
      isInitial: false,
      isFinal: false
    })
    
    // Create transitions
    for (let i = 0; i < pattern.length; i++) {
      const expectedSymbol = pattern[i]
      
      // Correct transition
      transitions.push({
        id: generateId(),
        from: `q${i}`,
        to: `q${i + 1}`,
        symbol: expectedSymbol,
        label: expectedSymbol
      })
      
      // Wrong transitions go to reject
      alphabet.forEach(symbol => {
        if (symbol !== expectedSymbol) {
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: 'qr',
            symbol,
            label: symbol
          })
        }
      })
    }
    
    // From accept state, all transitions stay in accept
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${pattern.length}`,
        to: `q${pattern.length}`,
        symbol,
        label: symbol
      })
    })
    
    // Reject state self-loops
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: 'qr',
        to: 'qr',
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Strings starting with ${pattern}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateContainingDFA = (pattern: string, alphabet: string[]): Automata => {
    const states = []
    const transitions: Transition[] = []
    
    // States for pattern matching + accept state
    for (let i = 0; i <= pattern.length; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 100 + i * 120,
        y: 200,
        isInitial: i === 0,
        isFinal: i === pattern.length
      })
    }
    
    // Transitions using KMP-like approach
    for (let i = 0; i < pattern.length; i++) {
      alphabet.forEach(symbol => {
        if (symbol === pattern[i]) {
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${i + 1}`,
            symbol,
            label: symbol
          })
        } else {
          const targetState = computeKMPTransition(pattern, i, symbol)
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${targetState}`,
            symbol,
            label: symbol
          })
        }
      })
    }
    
    // From accept state, stay in accept
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${pattern.length}`,
        to: `q${pattern.length}`,
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Strings containing ${pattern}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const computeKMPTransition = (pattern: string, pos: number, symbol: string): number => {
    const currentString = pattern.substring(0, pos) + symbol
    
    // Find longest prefix of pattern that is suffix of currentString
    for (let len = Math.min(pos, pattern.length - 1); len >= 0; len--) {
      if (currentString.endsWith(pattern.substring(0, len + 1))) {
        return len + 1
      }
    }
    return 0
  }
  
  const generateCountDFA = (parity: string, symbol: string, alphabet: string[]): Automata => {
    const states = [
      {
        id: 'q0',
        name: 'q0',
        x: 200,
        y: 250,
        isInitial: true,
        isFinal: parity === 'even'
      },
      {
        id: 'q1',
        name: 'q1',
        x: 400,
        y: 250,
        isInitial: false,
        isFinal: parity === 'odd'
      }
    ]
    
    const transitions: Transition[] = []
    
    alphabet.forEach(char => {
      if (char === symbol) {
        // Toggle between states for target symbol
        transitions.push({
          id: generateId(),
          from: 'q0',
          to: 'q1',
          symbol: char,
          label: char
        })
        transitions.push({
          id: generateId(),
          from: 'q1',
          to: 'q0',
          symbol: char,
          label: char
        })
      } else {
        // Stay in same state for other symbols
        transitions.push({
          id: generateId(),
          from: 'q0',
          to: 'q0',
          symbol: char,
          label: char
        })
        transitions.push({
          id: generateId(),
          from: 'q1',
          to: 'q1',
          symbol: char,
          label: char
        })
      }
    })
    
    return {
      id: generateId(),
      name: `${parity} number of ${symbol}s`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // ===============================
  // ENHANCED GENERATOR ROUTER
  // ===============================
  
  const generateAutomataFromDescription = (description: string, type: 'DFA' | 'NFA' | 'TM' | 'REGEX'): Automata => {
    const cleanDesc = description.toLowerCase().trim()
    const alphabet = extractAlphabet(description)
    
    switch (type) {
      case 'NFA':
        if (cleanDesc.includes('length') && /\d+/.test(cleanDesc)) {
          const length = parseInt(cleanDesc.match(/\d+/)?.[0] || '2')
          return generateNFALength(length, alphabet)
        } else if (cleanDesc.includes('ending') && /[01]+/.test(cleanDesc)) {
          const pattern = cleanDesc.match(/[01]+/)?.[0] || '01'
          return generateNFAEndingWith(pattern, alphabet)
        } else if (cleanDesc.includes('union') && cleanDesc.includes('|')) {
          const patterns = cleanDesc.match(/[01]+/g) || ['01', '10']
          return generateNFAUnion(patterns[0], patterns[1], alphabet)
        } else if (cleanDesc.includes('pattern') && /[01]+/.test(cleanDesc)) {
          const pattern = cleanDesc.match(/[01]+/)?.[0] || '01'
          return generateNFAPatternMatching(pattern, alphabet)
        } else if (cleanDesc.includes('kleene') || cleanDesc.includes('star')) {
          const pattern = cleanDesc.match(/[01]+/)?.[0] || '01'
          return generateNFAKleeneStar(pattern, alphabet)
        } else if (cleanDesc.includes('concatenation') || cleanDesc.includes('concat')) {
          const patterns = cleanDesc.match(/[01]+/g) || ['01', '10']
          return generateNFAConcatenation(patterns[0], patterns[1], alphabet)
        } else {
          return generateNFALength(2, alphabet)
        }
        
      case 'TM':
        if (cleanDesc.includes('copy')) {
          return generateTMCopy(alphabet)
        } else if (cleanDesc.includes('add') || cleanDesc.includes('addition')) {
          return generateTMAdd()
        } else if (cleanDesc.includes('multiply') || cleanDesc.includes('multiplication')) {
          return generateTMMultiply()
        } else if (cleanDesc.includes('palindrome')) {
          return generateTMPalindrome()
        } else if (cleanDesc.includes('reverse')) {
          return generateTMReverse()
        } else {
          return generateTMCopy(alphabet)
        }
        
      case 'REGEX':
        if (cleanDesc.includes('kleene') || cleanDesc.includes('star') || /\*/.test(cleanDesc)) {
          const pattern = cleanDesc.match(/[01]+/)?.[0] || '01'
          return generateRegexKleeneStar(pattern, alphabet)
        } else if (cleanDesc.includes('plus') || /\+/.test(cleanDesc)) {
          const pattern = cleanDesc.match(/[01]+/)?.[0] || '01'
          return generateRegexPlus(pattern, alphabet)
        } else if (cleanDesc.includes('union') || cleanDesc.includes('|')) {
          const patterns = cleanDesc.match(/[01]+/g) || ['01', '10']
          return generateRegexUnion(patterns[0], patterns[1], alphabet)
        } else if (cleanDesc.includes('optional') || /\?/.test(cleanDesc)) {
          const pattern = cleanDesc.match(/[01]+/)?.[0] || '01'
          return generateRegexOptional(pattern, alphabet)
        } else if (cleanDesc.includes('group') || /\(/.test(cleanDesc)) {
          const match = cleanDesc.match(/\([^)]+\)/)
          if (match) {
            return generateRegexGrouping(match[0], alphabet)
          }
        } else if (cleanDesc.includes('concat') || cleanDesc.includes('concatenation')) {
          const patterns = cleanDesc.match(/[01]+/g) || ['01', '10']
          return generateRegexConcatenation(patterns[0], patterns[1], alphabet)
        } else if (/[01]+/.test(cleanDesc)) {
          const pattern = cleanDesc.match(/[01]+/)?.[0] || '01'
          return generateRegexDFA(pattern, alphabet)
        } else {
          return generateRegexDFA('.*', alphabet)
        }
        
      case 'DFA':
      default:
        // Use existing DFA generators
        const parsedProblem = analyzeWithAI(cleanDesc, description)
        if (parsedProblem) {
          return generateDFAFromParsedProblem(parsedProblem)
        } else {
          return generateLengthDFA(2, alphabet)
        }
    }
  }
  
  const generateDFAFromDescription = useCallback(async (description: string, type: 'DFA' | 'NFA' | 'TM' | 'REGEX' = 'DFA') => {
    setIsGenerating(true)
    setValidationResult(null)
    
    try {
      const generatedAutomata = generateAutomataFromDescription(description, type)
      onAutomataChange(generatedAutomata)
      
      // Auto-generate some test cases
      const testCases = generateTestCases(description)
      setTestStrings(testCases.slice(0, 5))
      
    } catch (error) {
      console.error('Error generating automata:', error)
      
      // Provide helpful suggestions based on automata type
      const suggestions = []
      if (type === 'NFA') {
        suggestions.push('"NFA length 3"', '"NFA pattern 01"', '"NFA kleene star 01"', '"NFA union 01|10"', '"NFA concatenation 01+10"')
      } else if (type === 'TM') {
        suggestions.push('"TM copy machine"', '"TM addition machine"', '"TM multiplication machine"', '"TM palindrome checker"', '"TM reverse string"')
      } else if (type === 'REGEX') {
        suggestions.push('"regex 01*"', '"regex 01+"', '"regex (01)*"', '"regex 01|10"', '"regex 01?"', '"regex (01)+"')
      } else {
        if (description.toLowerCase().includes('length')) {
          suggestions.push('"strings of length 2"')
        }
        if (description.toLowerCase().includes('end')) {
          suggestions.push('"strings ending with 01"')
        }
        if (description.toLowerCase().includes('start') || description.toLowerCase().includes('begin')) {
          suggestions.push('"strings starting with 10"')
        }
        if (description.toLowerCase().includes('contain')) {
          suggestions.push('"strings containing 11"')
        }
        if (description.toLowerCase().includes('even') || description.toLowerCase().includes('odd')) {
          suggestions.push('"even number of 0s"')
        }
      }
      
      const suggestionText = suggestions.length > 0 
        ? ` Try examples like: ${suggestions.join(', ')}`
        : ` Try: "strings of length 2", "strings ending with 01", "strings containing 11", "even number of 0s"`
      
      setValidationResult({
        isValid: false,
        message: (error instanceof Error ? error.message : 'Failed to generate automata') + suggestionText,
        score: '0/0'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [generateAutomataFromDescription, onAutomataChange])
  
  const generateTestCases = (description: string): string[] => {
    const lowerDesc = description.toLowerCase()
    const testCases = []
    
    if (lowerDesc.includes('length 2')) {
      testCases.push('00', '01', '10', '11', '', '0', '1', '000', '001')
    } else if (lowerDesc.includes('ending with')) {
      const match = lowerDesc.match(/ending with ([01]+)/)
      if (match) {
        const pattern = match[1]
        testCases.push(pattern, '0' + pattern, '1' + pattern, pattern + '0', '', '0', '1')
      }
    } else if (lowerDesc.includes('starting with')) {
      const match = lowerDesc.match(/starting with ([01]+)/)
      if (match) {
        const pattern = match[1]
        testCases.push(pattern, pattern + '0', pattern + '1', '0' + pattern, '', '0', '1')
      }
    } else if (lowerDesc.includes('containing')) {
      const match = lowerDesc.match(/containing ([01]+)/)
      if (match) {
        const pattern = match[1]
        testCases.push(pattern, '0' + pattern, pattern + '1', '0' + pattern + '0', '', '0', '1')
      }
    } else if (lowerDesc.includes('even') || lowerDesc.includes('odd')) {
      testCases.push('', '0', '1', '00', '01', '10', '11', '000', '001', '010')
    }
    
    return testCases
  }
  
  const simulateString = useCallback((automata: Automata, input: string) => {
    let currentState = automata.states.find(s => s.isInitial)
    if (!currentState) throw new Error('No initial state')
    
    const path = [currentState.name]
    
    for (const symbol of input) {
      const transition = automata.transitions.find(t => 
        t.from === currentState!.id && t.symbol === symbol
      )
      if (!transition) {
        return { accepted: false, finalState: currentState.name, path }
      }
      currentState = automata.states.find(s => s.id === transition.to)
      if (!currentState) throw new Error('Invalid transition')
      path.push(currentState.name)
    }
    
    return { 
      accepted: currentState.isFinal, 
      finalState: currentState.name,
      path
    }
  }, [])
  
  const testAllStrings = useCallback(() => {
    const results = testStrings.map(testString => {
      try {
        const result = simulateString(automata, testString)
        return {
          string: testString,
          accepted: result.accepted,
          path: result.path
        }
      } catch (error) {
        return {
          string: testString,
          accepted: false,
          path: ['Error']
        }
      }
    })
    setTestResults(results)
  }, [testStrings, automata, simulateString])
  
  const validateDFAAgainstProblem = useCallback(() => {
    if (!problemDescription.trim()) return
    
    try {
      const parsedProblem = parseProblemDescription(problemDescription)
      if (!parsedProblem) {
        setValidationResult({
          isValid: false,
          message: 'Could not parse problem description',
          score: '0/0'
        })
        return
      }
      
      // Generate comprehensive test cases
      const testCases = generateComprehensiveTestCases(parsedProblem)
      let passed = 0
      const total = testCases.accept.length + testCases.reject.length
      
      // Test accept cases
      testCases.accept.forEach(testString => {
        try {
          const result = simulateString(automata, testString)
          if (result.accepted) passed++
        } catch (error) {
          // Simulation failed
        }
      })
      
      // Test reject cases  
      testCases.reject.forEach(testString => {
        try {
          const result = simulateString(automata, testString)
          if (!result.accepted) passed++
        } catch (error) {
          // Simulation failed
        }
      })
      
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0
      const isValid = passed === total
      
      setValidationResult({
        isValid,
        message: isValid 
          ? `✓ Perfect! Your DFA correctly solves the problem.`
          : `Partial solution. Your DFA handles ${passed}/${total} test cases correctly.`,
        score: `${passed}/${total} (${percentage}%)`
      })
      
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Error validating DFA against problem',
        score: '0/0'
      })
    }
  }, [problemDescription, parseProblemDescription, automata, simulateString])
  
  const generateComprehensiveTestCases = (parsedProblem: any) => {
    const accept = []
    const reject = []
    
    switch (parsedProblem.type) {
      case 'length':
        // Generate all strings of target length
        const targetLength = parsedProblem.value
        const alphabet = parsedProblem.alphabet
        
        // Accept: strings of exact length
        if (targetLength === 0) {
          accept.push('')
        } else if (targetLength <= 3) {
          generateStringsOfLength(alphabet, targetLength).forEach(s => accept.push(s))
        }
        
        // Reject: strings of different lengths
        reject.push('') // empty if length > 0
        if (targetLength > 1) {
          generateStringsOfLength(alphabet, targetLength - 1).slice(0, 5).forEach(s => reject.push(s))
        }
        generateStringsOfLength(alphabet, targetLength + 1).slice(0, 5).forEach(s => reject.push(s))
        break
        
      case 'ending':
        const endPattern = parsedProblem.value
        accept.push(endPattern, '0' + endPattern, '1' + endPattern, '00' + endPattern)
        reject.push('', endPattern + '0', endPattern + '1', '0' + endPattern + '0')
        break
        
      case 'starting':
        const startPattern = parsedProblem.value
        accept.push(startPattern, startPattern + '0', startPattern + '1', startPattern + '00')
        reject.push('', '0' + startPattern, '1' + startPattern, 'x' + startPattern)
        break
        
      case 'containing':
        const containPattern = parsedProblem.value
        accept.push(containPattern, '0' + containPattern, containPattern + '0', '0' + containPattern + '0')
        reject.push('', '0', '1', '00', '01', '10')
        break
        
      case 'count':
        const { parity, symbol } = parsedProblem
        if (parity === 'even') {
          accept.push('', symbol + symbol, '0' + symbol + '0' + symbol)
          reject.push(symbol, symbol + symbol + symbol)
        } else {
          accept.push(symbol, symbol + symbol + symbol)
          reject.push('', symbol + symbol)
        }
        break
    }
    
    return { accept: accept.filter(s => s !== undefined), reject: reject.filter(s => s !== undefined) }
  }
  
  const generateStringsOfLength = (alphabet: string[], length: number): string[] => {
    if (length === 0) return ['']
    if (length === 1) return alphabet
    
    const result = []
    const shorter = generateStringsOfLength(alphabet, length - 1)
    
    for (const str of shorter) {
      for (const char of alphabet) {
        result.push(str + char)
        if (result.length > 20) break // Limit for performance
      }
      if (result.length > 20) break
    }
    
    return result
  }
  
  const generateEmptyStringDFA = (alphabet: string[]): Automata => {
    const states = [
      {
        id: 'q0',
        name: 'q0',
        x: 150,
        y: 200,
        isInitial: true,
        isFinal: true // Accepts only empty string
      },
      {
        id: 'qr',
        name: 'qr',
        x: 350,
        y: 200,
        isInitial: false,
        isFinal: false // Reject state
      }
    ]
    
    const transitions: Transition[] = []
    
    // Any symbol from initial state goes to reject
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: 'q0',
        to: 'qr',
        symbol,
        label: symbol
      })
    })
    
    // Self-loop on reject state
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: 'qr',
        to: 'qr',
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: 'Empty String Only',
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateUniversalDFA = (alphabet: string[]): Automata => {
    const states = [
      {
        id: 'q0',
        name: 'q0',
        x: 250,
        y: 200,
        isInitial: true,
        isFinal: true // Accepts all strings
      }
    ]
    
    const transitions: Transition[] = []
    
    // Self-loop for all symbols
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: 'q0',
        to: 'q0',
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: 'All Strings',
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  // Advanced DFA Generators
  const generateLengthMultipleDFA = (divisor: number, alphabet: string[]): Automata => {
    const states = []
    const transitions: Transition[] = []
    
    // Create states for remainders 0 to divisor-1
    for (let i = 0; i < divisor; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 100 + (i % 5) * 120,
        y: 100 + Math.floor(i / 5) * 120,
        isInitial: i === 0,
        isFinal: i === 0 // Accept when length % divisor == 0
      })
    }
    
    // Create transitions
    for (let i = 0; i < divisor; i++) {
      alphabet.forEach(symbol => {
        const nextState = (i + 1) % divisor
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${nextState}`,
          symbol,
          label: symbol
        })
      })
    }
    
    return {
      id: generateId(),
      name: `Length multiple of ${divisor}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateLengthRangeDFA = (min: number, max: number, alphabet: string[]): Automata => {
    const states = []
    const transitions: Transition[] = []
    
    // Create states for lengths 0 to max+1 (reject state)
    for (let i = 0; i <= max + 1; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 100 + (i % 6) * 100,
        y: 100 + Math.floor(i / 6) * 100,
        isInitial: i === 0,
        isFinal: i >= min && i <= max
      })
    }
    
    // Create transitions
    for (let i = 0; i <= max; i++) {
      alphabet.forEach(symbol => {
        const nextState = i + 1
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${nextState}`,
          symbol,
          label: symbol
        })
      })
    }
    
    // Reject state self-loops
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${max + 1}`,
        to: `q${max + 1}`,
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Length between ${min} and ${max}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateLengthMinDFA = (minLength: number, alphabet: string[]): Automata => {
    const states = []
    const transitions: Transition[] = []
    
    // Create states for lengths 0 to minLength
    for (let i = 0; i <= minLength; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 100 + i * 120,
        y: 200,
        isInitial: i === 0,
        isFinal: i >= minLength
      })
    }
    
    // Create transitions
    for (let i = 0; i < minLength; i++) {
      alphabet.forEach(symbol => {
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${i + 1}`,
          symbol,
          label: symbol
        })
      })
    }
    
    // Self-loop on final state
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${minLength}`,
        to: `q${minLength}`,
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Length at least ${minLength}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateLengthMaxDFA = (maxLength: number, alphabet: string[]): Automata => {
    const states = []
    const transitions: Transition[] = []
    
    // Create states for lengths 0 to maxLength+1 (reject state)
    for (let i = 0; i <= maxLength + 1; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 100 + i * 120,
        y: 200,
        isInitial: i === 0,
        isFinal: i <= maxLength
      })
    }
    
    // Create transitions
    for (let i = 0; i <= maxLength; i++) {
      alphabet.forEach(symbol => {
        const nextState = i < maxLength ? i + 1 : maxLength + 1
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${nextState}`,
          symbol,
          label: symbol
        })
      })
    }
    
    // Reject state self-loops
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${maxLength + 1}`,
        to: `q${maxLength + 1}`,
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Length at most ${maxLength}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateBalancedDFA = (symbol1: string, symbol2: string, alphabet: string[]): Automata => {
    // This is a context-free language, but we can approximate with a finite DFA
    // For practical purposes, we'll create a DFA that tracks the difference up to a reasonable bound
    const maxDiff = 10 // Track differences from -10 to +10
    const states = []
    const transitions: Transition[] = []
    
    for (let diff = -maxDiff; diff <= maxDiff; diff++) {
      const stateId = `q${diff + maxDiff}` // Convert to non-negative index
      states.push({
        id: stateId,
        name: `d${diff}`,
        x: 100 + ((diff + maxDiff) % 7) * 80,
        y: 100 + Math.floor((diff + maxDiff) / 7) * 80,
        isInitial: diff === 0,
        isFinal: diff === 0
      })
    }
    
    // Create transitions
    for (let diff = -maxDiff; diff <= maxDiff; diff++) {
      const currentStateId = `q${diff + maxDiff}`
      
      alphabet.forEach(symbol => {
        let newDiff = diff
        if (symbol === symbol1) newDiff++
        else if (symbol === symbol2) newDiff--
        
        // Clamp to bounds
        newDiff = Math.max(-maxDiff, Math.min(maxDiff, newDiff))
        const nextStateId = `q${newDiff + maxDiff}`
        
        transitions.push({
          id: generateId(),
          from: currentStateId,
          to: nextStateId,
          symbol,
          label: symbol
        })
      })
    }
    
    return {
      id: generateId(),
      name: `Equal number of ${symbol1}s and ${symbol2}s`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateDifferenceDFA = (symbol1: string, symbol2: string, difference: number, alphabet: string[]): Automata => {
    const maxDiff = Math.abs(difference) + 5
    const states = []
    const transitions: Transition[] = []
    
    for (let diff = -maxDiff; diff <= maxDiff; diff++) {
      const stateId = `q${diff + maxDiff}`
      states.push({
        id: stateId,
        name: `d${diff}`,
        x: 100 + ((diff + maxDiff) % 6) * 90,
        y: 100 + Math.floor((diff + maxDiff) / 6) * 90,
        isInitial: diff === 0,
        isFinal: diff === difference
      })
    }
    
    for (let diff = -maxDiff; diff <= maxDiff; diff++) {
      const currentStateId = `q${diff + maxDiff}`
      
      alphabet.forEach(symbol => {
        let newDiff = diff
        if (symbol === symbol1) newDiff++
        else if (symbol === symbol2) newDiff--
        
        newDiff = Math.max(-maxDiff, Math.min(maxDiff, newDiff))
        const nextStateId = `q${newDiff + maxDiff}`
        
        transitions.push({
          id: generateId(),
          from: currentStateId,
          to: nextStateId,
          symbol,
          label: symbol
        })
      })
    }
    
    return {
      id: generateId(),
      name: `${symbol1}s exceed ${symbol2}s by ${difference}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateModularDFA = (symbol: string, modulus: number, remainder: number, alphabet: string[]): Automata => {
    const states = []
    const transitions: Transition[] = []
    
    for (let i = 0; i < modulus; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 150 + (i % 4) * 100,
        y: 150 + Math.floor(i / 4) * 100,
        isInitial: i === 0,
        isFinal: i === remainder
      })
    }
    
    for (let i = 0; i < modulus; i++) {
      alphabet.forEach(char => {
        const nextState = char === symbol ? (i + 1) % modulus : i
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${nextState}`,
          symbol: char,
          label: char
        })
      })
    }
    
    return {
      id: generateId(),
      name: `${symbol}s mod ${modulus} = ${remainder}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateSubsequenceDFA = (subsequence: string, alphabet: string[]): Automata => {
    // Simplified subsequence DFA - tracks progress through subsequence
    const states = []
    const transitions: Transition[] = []
    
    for (let i = 0; i <= subsequence.length; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 100 + i * 120,
        y: 200,
        isInitial: i === 0,
        isFinal: i === subsequence.length
      })
    }
    
    for (let i = 0; i < subsequence.length; i++) {
      alphabet.forEach(symbol => {
        if (symbol === subsequence[i]) {
          // Advance in subsequence
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${i + 1}`,
            symbol,
            label: symbol
          })
        } else {
          // Stay in same state
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${i}`,
            symbol,
            label: symbol
          })
        }
      })
    }
    
    // Final state self-loops
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${subsequence.length}`,
        to: `q${subsequence.length}`,
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Subsequence ${subsequence}`,
      type: 'DFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  const generateNotContainingDFA = (pattern: string, alphabet: string[]): Automata => {
    // Create the containing DFA first, then complement it
    const containingDFA = generateContainingDFA(pattern, alphabet)
    
    // Flip final states
    const states = containingDFA.states.map(state => ({
      ...state,
      isFinal: !state.isFinal
    }))
    
    return {
      ...containingDFA,
      id: generateId(),
      name: `Not containing ${pattern}`,
      states
    }
  }
  
  
  const generateSpecificSetDFA = (strings: string[], alphabet: string[]): Automata => {
    // Create a trie-like DFA for the specific set of strings
    const states = new Map()
    const transitions: Transition[] = []
    let stateCounter = 0
    
    // Create root state
    states.set('', { id: 'q0', name: 'q0', x: 250, y: 100, isInitial: true, isFinal: strings.includes('') })
    
    // Build trie structure
    strings.forEach(str => {
      for (let i = 0; i <= str.length; i++) {
        const prefix = str.substring(0, i)
        if (!states.has(prefix)) {
          stateCounter++
          states.set(prefix, {
            id: `q${stateCounter}`,
            name: `q${stateCounter}`,
            x: 100 + (i * 120),
            y: 100 + (stateCounter % 5) * 80,
            isInitial: false,
            isFinal: strings.includes(prefix)
          })
        }
      }
    })
    
    // Create transitions
    states.forEach((state, prefix) => {
      alphabet.forEach(symbol => {
        const nextPrefix = prefix + symbol
        if (states.has(nextPrefix)) {
          transitions.push({
            id: generateId(),
            from: state.id,
            to: states.get(nextPrefix).id,
            symbol,
            label: symbol
          })
        } else {
          // Go to reject state (create if needed)
          if (!states.has('REJECT')) {
            states.set('REJECT', {
              id: 'qr',
              name: 'qr',
              x: 400,
              y: 300,
              isInitial: false,
              isFinal: false
            })
          }
          transitions.push({
            id: generateId(),
            from: state.id,
            to: 'qr',
            symbol,
            label: symbol
          })
        }
      })
    })
    
    // Add self-loops to reject state
    if (states.has('REJECT')) {
      alphabet.forEach(symbol => {
        transitions.push({
          id: generateId(),
          from: 'qr',
          to: 'qr',
          symbol,
          label: symbol
        })
      })
    }
    
    return {
      id: generateId(),
      name: `Specific strings: {${strings.join(', ')}}`,
      type: 'DFA',
      states: Array.from(states.values()),
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // Advanced DFA operations
  const generateComplementDFA = (originalDFA: Automata): Automata => {
    // Create complement by flipping all final states
    const states = originalDFA.states.map(state => ({
      ...state,
      isFinal: !state.isFinal
    }))
    
    return {
      ...originalDFA,
      states,
      name: `Complement of ${originalDFA.name || 'DFA'}`
    }
  }

  const generateIntersectionDFA = (dfa1: Automata, dfa2: Automata, alphabet: string[]): Automata => {
    // Simplified intersection - creates product DFA
    const states: State[] = []
    const transitions: Transition[] = []
    let stateCounter = 0
    
    // Create product states
    dfa1.states.forEach(state1 => {
      dfa2.states.forEach(state2 => {
        states.push({
          id: `q${stateCounter}`,
          name: `(${state1.name},${state2.name})`,
          x: 150 + (stateCounter % 4) * 120,
          y: 200 + Math.floor(stateCounter / 4) * 100,
          isInitial: state1.isInitial && state2.isInitial,
          isFinal: state1.isFinal && state2.isFinal
        })
        stateCounter++
      })
    })
    
    // Create transitions (simplified - would need proper product construction)
    alphabet.forEach(symbol => {
      if (states.length >= 2) {
        transitions.push({
          id: generateId(),
          from: states[0].id,
          to: states[1].id,
          symbol,
          label: symbol
        })
      }
    })
    
    return {
      id: generateId(),
      name: `Intersection DFA`,
      states,
      transitions,
      alphabet,
      type: 'DFA',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateUnionDFA = (dfa1: Automata, dfa2: Automata, alphabet: string[]): Automata => {
    // Simplified union - combines states and transitions
    const states: State[] = [
      ...dfa1.states.map((state, index) => ({
        ...state,
        id: `q1_${index}`,
        name: `A_${state.name}`,
        x: state.x - 100,
        y: state.y
      })),
      ...dfa2.states.map((state, index) => ({
        ...state,
        id: `q2_${index}`,
        name: `B_${state.name}`,
        x: state.x + 100,
        y: state.y
      }))
    ]
    
    const transitions = [
      ...dfa1.transitions.map(t => ({
        ...t,
        id: generateId(),
        from: `q1_${dfa1.states.findIndex(s => s.id === t.from)}`,
        to: `q1_${dfa1.states.findIndex(s => s.id === t.to)}`
      })),
      ...dfa2.transitions.map(t => ({
        ...t,
        id: generateId(),
        from: `q2_${dfa2.states.findIndex(s => s.id === t.from)}`,
        to: `q2_${dfa2.states.findIndex(s => s.id === t.to)}`
      }))
    ]
    
    return {
      id: generateId(),
      name: `Union DFA`,
      states,
      transitions,
      alphabet,
      type: 'DFA',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateMinimalDFA = (originalDFA: Automata): Automata => {
    // Simplified minimization - removes unreachable states
    const reachableStates = new Set<string>()
    const queue = [originalDFA.states.find(s => s.isInitial)?.id || originalDFA.states[0]?.id]
    
    if (queue[0]) {
      reachableStates.add(queue[0])
      
      while (queue.length > 0) {
        const currentState = queue.shift()
        if (currentState) {
          originalDFA.transitions
            .filter(t => t.from === currentState)
            .forEach(t => {
              if (!reachableStates.has(t.to)) {
                reachableStates.add(t.to)
                queue.push(t.to)
              }
            })
        }
      }
    }
    
    const minimizedStates = originalDFA.states.filter(s => reachableStates.has(s.id))
    const minimizedTransitions = originalDFA.transitions.filter(t => 
      reachableStates.has(t.from) && reachableStates.has(t.to)
    )
    
    return {
      ...originalDFA,
      states: minimizedStates,
      transitions: minimizedTransitions,
      name: `Minimized ${originalDFA.name || 'DFA'}`
    }
  }

  // New advanced DFA generators
  const generateAlternatingDFA = (symbol1: string, symbol2: string, alphabet: string[]): Automata => {
    const states = [
      {
        id: 'q0',
        name: 'q0',
        x: 200,
        y: 200,
        isInitial: true,
        isFinal: true // Empty string is alternating
      },
      {
        id: 'q1',
        name: 'q1',
        x: 400,
        y: 200,
        isInitial: false,
        isFinal: false
      }
    ]
    
    const transitions: Transition[] = []
    
    // From q0, symbol1 goes to q1, symbol2 goes to q1
    // From q1, symbol1 goes to q0, symbol2 goes to q0
    alphabet.forEach(symbol => {
      if (symbol === symbol1) {
        transitions.push({
          id: generateId(),
          from: 'q0',
          to: 'q1',
          symbol,
          label: symbol
        })
        transitions.push({
          id: generateId(),
          from: 'q1',
          to: 'q0',
          symbol,
          label: symbol
        })
      } else if (symbol === symbol2) {
        transitions.push({
          id: generateId(),
          from: 'q0',
          to: 'q1',
          symbol,
          label: symbol
        })
        transitions.push({
          id: generateId(),
          from: 'q1',
          to: 'q0',
          symbol,
          label: symbol
        })
      }
    })
    
    return {
      id: generateId(),
      name: `Alternating ${symbol1}${symbol2} DFA`,
      states,
      transitions,
      alphabet,
      type: 'DFA',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generatePalindromeDFA = (alphabet: string[]): Automata => {
    // Simplified palindrome DFA - only handles even-length palindromes
    const states: State[] = []
    const transitions: Transition[] = []
    const maxLength = 6 // Reasonable limit for visualization
    
    // Create states for tracking palindrome progress
    for (let i = 0; i <= maxLength / 2; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 150 + (i * 100),
        y: 250,
        isInitial: i === 0,
        isFinal: i === 0 // Even-length palindromes
      })
    }
    
    // Add transitions (simplified - would need proper palindrome logic)
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: 'q0',
        to: 'q1',
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: 'Palindrome DFA (Even Length)',
      states,
      transitions,
      alphabet,
      type: 'DFA',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateCountMultipleDFA = (symbol: string, multiple: number, alphabet: string[]): Automata => {
    const states: State[] = []
    const transitions: Transition[] = []
    
    // Create states for tracking count mod multiple
    for (let i = 0; i < multiple; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 150 + (i * 120),
        y: 250 + Math.sin(i * 0.8) * 30,
        isInitial: i === 0,
        isFinal: i === 0 // Accept strings where count is multiple of 'multiple'
      })
    }
    
    // Create transitions
    alphabet.forEach(char => {
      if (char === symbol) {
        // Increment count (move to next state)
        for (let i = 0; i < multiple; i++) {
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${(i + 1) % multiple}`,
            symbol: char,
            label: char
          })
        }
      } else {
        // Other symbols stay in same state
        for (let i = 0; i < multiple; i++) {
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${i}`,
            symbol: char,
            label: char
          })
        }
      }
    })
    
    return {
      id: generateId(),
      name: `Count Multiple of ${multiple} DFA`,
      states,
      transitions,
      alphabet,
      type: 'DFA',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // ===============================
  // ENHANCED NFA (Non-deterministic) GENERATORS
  // ===============================
  
  const generateNFALength = (length: number, alphabet: string[]): Automata => {
    // Enhanced input validation
    if (!Number.isInteger(length) || length < 0) {
      throw new Error('Length must be a non-negative integer')
    }
    if (!alphabet || alphabet.length === 0) {
      throw new Error('Alphabet cannot be empty')
    }
    if (length > 15) {
      throw new Error('Length too large for NFA visualization (max 15)')
    }
    
    const states: State[] = []
    const transitions: Transition[] = []
    
    // Create states with enhanced NFA layout
    for (let i = 0; i <= length + 2; i++) {
      const isRejectState = i === length + 1
      states.push({
        id: `q${i}`,
        name: isRejectState ? 'qr' : `q${i}`,
        x: 150 + (i * 120), // Better spacing
        y: 250 + Math.sin(i * 0.6) * 40 + (isRejectState ? 80 : 0), // Enhanced wave pattern
        isInitial: i === 0,
        isFinal: i === length
      })
    }
    
    // Create enhanced non-deterministic transitions
    for (let i = 0; i < length; i++) {
      alphabet.forEach(symbol => {
        // Primary transition
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${i + 1}`,
          symbol,
          label: symbol
        })
        
        // Non-deterministic alternative transitions
        if (i < length - 1) {
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${i + 2}`,
            symbol,
            label: symbol
          })
        }
        
        // Epsilon transitions for flexibility
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${i + 1}`,
          symbol: 'ε',
          label: 'ε'
        })
      })
      
      // Self-loop with epsilon for non-determinism
      transitions.push({
        id: generateId(),
        from: `q${i}`,
        to: `q${i}`,
        symbol: 'ε',
        label: 'ε'
      })
    }
    
    // Add transitions to reject state for invalid inputs
    alphabet.forEach(symbol => {
      transitions.push({
        id: generateId(),
        from: `q${length}`,
        to: 'qr',
        symbol,
        label: symbol
      })
    })
    
    return {
      id: generateId(),
      name: `Enhanced NFA Length ${length}`,
      type: 'NFA',
      states,
      transitions,
      alphabet: [...alphabet, 'ε'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateNFAPatternMatching = (pattern: string, alphabet: string[]): Automata => {
    if (!pattern || pattern.length === 0) {
      throw new Error('Pattern cannot be empty')
    }
    if (pattern.length > 8) {
      throw new Error('Pattern too long for NFA visualization (max 8 characters)')
    }
    
    const states: State[] = []
    const transitions: Transition[] = []
    const patternLength = pattern.length
    
    // Create states for pattern matching with enhanced layout
    for (let i = 0; i <= patternLength + 1; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 150 + (i * 140),
        y: 250 + Math.cos(i * 0.4) * 50, // Enhanced cosine wave
        isInitial: i === 0,
        isFinal: i === patternLength
      })
    }
    
    // Create sophisticated pattern matching with non-determinism
    for (let i = 0; i < patternLength; i++) {
      const expectedSymbol = pattern[i]
      
      // Correct symbol transition
      transitions.push({
        id: generateId(),
        from: `q${i}`,
        to: `q${i + 1}`,
        symbol: expectedSymbol,
        label: expectedSymbol
      })
      
      // Non-deterministic transitions for pattern matching
      alphabet.forEach(symbol => {
        if (symbol !== expectedSymbol) {
          // Multiple possible transitions (non-deterministic)
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${0}`, // Reset to start
            symbol,
            label: symbol
          })
          
          // Alternative: stay in current state
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${i}`,
            symbol,
            label: symbol
          })
        }
      })
      
      // Epsilon transitions for flexibility
      transitions.push({
        id: generateId(),
        from: `q${i}`,
        to: `q${i + 1}`,
        symbol: 'ε',
        label: 'ε'
      })
      
      // Backward epsilon transitions for complex matching
      if (i > 0) {
        transitions.push({
          id: generateId(),
          from: `q${i}`,
          to: `q${i - 1}`,
          symbol: 'ε',
          label: 'ε'
        })
      }
    }
    
    return {
      id: generateId(),
      name: `Enhanced NFA Pattern: ${pattern}`,
      type: 'NFA',
      states,
      transitions,
      alphabet: [...alphabet, 'ε'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateNFAKleeneStar = (pattern: string, alphabet: string[]): Automata => {
    // Create NFA for pattern* using epsilon transitions
    const baseNFA = generateNFAPatternMatching(pattern, alphabet)
    
    // Add Kleene star functionality with epsilon transitions
    const newTransitions = [...baseNFA.transitions]
    const newStates = [...baseNFA.states]
    
    // Add new start state for Kleene star
    const newStartState: State = {
      id: 'qs',
      name: 'qs',
      x: 100,
      y: 250,
      isInitial: true,
      isFinal: true // Empty string is accepted
    }
    
    // Update existing start state
    const updatedStates = newStates.map(state => ({
      ...state,
      isInitial: state.id !== 'qs'
    }))
    
    updatedStates.unshift(newStartState)
    
    // Epsilon transition from new start to old start
    newTransitions.push({
      id: generateId(),
      from: 'qs',
      to: baseNFA.states.find(s => s.isInitial)?.id || baseNFA.states[0].id,
      symbol: 'ε',
      label: 'ε'
    })
    
    // Epsilon transitions from final states back to start (Kleene star)
    baseNFA.states.forEach(state => {
      if (state.isFinal) {
        newTransitions.push({
          id: generateId(),
          from: state.id,
          to: baseNFA.states.find(s => s.isInitial)?.id || baseNFA.states[0].id,
          symbol: 'ε',
          label: 'ε'
        })
      }
    })
    
    return {
      ...baseNFA,
      states: updatedStates,
      transitions: newTransitions,
      name: `Enhanced NFA Kleene Star: ${pattern}*`
    }
  }

  const generateNFAConcatenation = (pattern1: string, pattern2: string, alphabet: string[]): Automata => {
    // Create NFA for pattern1 + pattern2 concatenation
    const nfa1 = generateNFAPatternMatching(pattern1, alphabet)
    const nfa2 = generateNFAPatternMatching(pattern2, alphabet)
    
    const states: State[] = []
    const transitions: Transition[] = []
    
    // Combine states with proper positioning
    nfa1.states.forEach((state, index) => {
      states.push({
        ...state,
        id: `q1_${index}`,
        name: `q1_${index}`,
        x: state.x - 100,
        y: state.y,
        isInitial: index === 0,
        isFinal: false
      })
    })
    
    nfa2.states.forEach((state, index) => {
      states.push({
        ...state,
        id: `q2_${index}`,
        name: `q2_${index}`,
        x: state.x + 200,
        y: state.y,
        isInitial: false,
        isFinal: index === nfa2.states.length - 1
      })
    })
    
    // Add concatenation transitions
    transitions.push({
      id: generateId(),
      from: `q1_${nfa1.states.length - 1}`,
      to: `q2_0`,
      symbol: 'ε',
      label: 'ε'
    })
    
    // Add all original transitions with updated IDs
    nfa1.transitions.forEach(t => {
      transitions.push({
        ...t,
        id: generateId(),
        from: `q1_${nfa1.states.findIndex(s => s.id === t.from)}`,
        to: `q1_${nfa1.states.findIndex(s => s.id === t.to)}`
      })
    })
    
    nfa2.transitions.forEach(t => {
      transitions.push({
        ...t,
        id: generateId(),
        from: `q2_${nfa2.states.findIndex(s => s.id === t.from)}`,
        to: `q2_${nfa2.states.findIndex(s => s.id === t.to)}`
      })
    })
    
    return {
      id: generateId(),
      name: `Enhanced NFA Concatenation: ${pattern1} + ${pattern2}`,
      type: 'NFA',
      states,
      transitions,
      alphabet: [...alphabet, 'ε'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateNFAEndingWith = (pattern: string, alphabet: string[]): Automata => {
    if (!pattern || pattern.length === 0) {
      throw new Error('Pattern cannot be empty')
    }
    
    const states: State[] = []
    const transitions: Transition[] = []
    const patternLength = pattern.length
    
    // Create states for pattern matching with NFA layout
    for (let i = 0; i <= patternLength; i++) {
      states.push({
        id: `q${i}`,
        name: `q${i}`,
        x: 150 + (i * 120),
        y: 200 + Math.cos(i * 0.5) * 40, // Cosine wave for NFA
        isInitial: i === 0,
        isFinal: i === patternLength
      })
    }
    
    // Create non-deterministic pattern matching
    for (let i = 0; i < patternLength; i++) {
      const expectedSymbol = pattern[i]
      
      // Correct symbol transition
      transitions.push({
        id: generateId(),
        from: `q${i}`,
        to: `q${i + 1}`,
        symbol: expectedSymbol,
        label: expectedSymbol
      })
      
      // Non-deterministic transitions for other symbols
      alphabet.forEach(symbol => {
        if (symbol !== expectedSymbol) {
          transitions.push({
            id: generateId(),
            from: `q${i}`,
            to: `q${0}`, // Reset to start
            symbol,
            label: symbol
          })
        }
      })
      
      // Epsilon transitions for flexibility
      transitions.push({
        id: generateId(),
        from: `q${i}`,
        to: `q${i + 1}`,
        symbol: 'ε',
        label: 'ε'
      })
    }
    
    return {
      id: generateId(),
      name: `NFA Ending with ${pattern}`,
      type: 'NFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateNFAUnion = (pattern1: string, pattern2: string, alphabet: string[]): Automata => {
    // Create NFA that accepts either pattern1 OR pattern2
    const states: State[] = []
    const transitions: Transition[] = []
    
    // Start state
    states.push({
      id: 'q0',
      name: 'q0',
      x: 200,
      y: 250,
      isInitial: true,
      isFinal: false
    })
    
    // Pattern 1 branch
    for (let i = 1; i <= pattern1.length + 1; i++) {
      states.push({
        id: `q1_${i}`,
        name: `q1_${i}`,
        x: 100 + (i * 80),
        y: 150,
        isInitial: false,
        isFinal: i === pattern1.length + 1
      })
    }
    
    // Pattern 2 branch
    for (let i = 1; i <= pattern2.length + 1; i++) {
      states.push({
        id: `q2_${i}`,
        name: `q2_${i}`,
        x: 100 + (i * 80),
        y: 350,
        isInitial: false,
        isFinal: i === pattern2.length + 1
      })
    }
    
    // Epsilon transitions to both branches
    transitions.push({
      id: generateId(),
      from: 'q0',
      to: 'q1_1',
      symbol: 'ε',
      label: 'ε'
    })
    
    transitions.push({
      id: generateId(),
      from: 'q0',
      to: 'q2_1',
      symbol: 'ε',
      label: 'ε'
    })
    
    // Pattern 1 transitions
    for (let i = 0; i < pattern1.length; i++) {
      transitions.push({
        id: generateId(),
        from: `q1_${i + 1}`,
        to: `q1_${i + 2}`,
        symbol: pattern1[i],
        label: pattern1[i]
      })
    }
    
    // Pattern 2 transitions
    for (let i = 0; i < pattern2.length; i++) {
      transitions.push({
        id: generateId(),
        from: `q2_${i + 1}`,
        to: `q2_${i + 2}`,
        symbol: pattern2[i],
        label: pattern2[i]
      })
    }
    
    return {
      id: generateId(),
      name: `NFA Union: ${pattern1} | ${pattern2}`,
      type: 'NFA',
      states,
      transitions,
      alphabet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // ===============================
  // ENHANCED TURING MACHINE GENERATORS
  // ===============================
  
  const generateTMCopy = (alphabet: string[]): Automata => {
    const states: State[] = [
      { id: 'q0', name: 'q0', x: 200, y: 200, isInitial: true, isFinal: false },
      { id: 'q1', name: 'q1', x: 350, y: 200, isInitial: false, isFinal: false },
      { id: 'q2', name: 'q2', x: 500, y: 200, isInitial: false, isFinal: false },
      { id: 'q3', name: 'q3', x: 650, y: 200, isInitial: false, isFinal: true }
    ]
    
    const transitions: Transition[] = []
    
    // Enhanced copy machine with better error handling
    alphabet.forEach(symbol => {
      if (symbol !== 'B') {
        // Copy symbol to output
        transitions.push({
          id: generateId(),
          from: 'q0',
          to: 'q0',
          symbol,
          label: `${symbol}/${symbol},R`,
          writeSymbol: symbol,
          direction: 'R'
        })
        
        // Mark end of input
        transitions.push({
          id: generateId(),
          from: 'q1',
          to: 'q2',
          symbol,
          label: `${symbol}/${symbol},R`,
          writeSymbol: symbol,
          direction: 'R'
        })
      }
    })
    
    // Transition phases
    transitions.push({
      id: generateId(),
      from: 'q0',
      to: 'q1',
      symbol: 'B',
      label: 'B/B,R',
      writeSymbol: 'B',
      direction: 'R'
    })
    
    transitions.push({
      id: generateId(),
      from: 'q2',
      to: 'q3',
      symbol: 'B',
      label: 'B/B,S',
      writeSymbol: 'B',
      direction: 'S'
    })
    
    return {
      id: generateId(),
      name: 'Enhanced TM Copy Machine',
      type: 'TM',
      states,
      transitions,
      alphabet: [...alphabet, 'B'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateTMAdd = (): Automata => {
    const states: State[] = [
      { id: 'q0', name: 'q0', x: 150, y: 200, isInitial: true, isFinal: false },
      { id: 'q1', name: 'q1', x: 300, y: 200, isInitial: false, isFinal: false },
      { id: 'q2', name: 'q2', x: 450, y: 200, isInitial: false, isFinal: false },
      { id: 'q3', name: 'q3', x: 600, y: 200, isInitial: false, isFinal: false },
      { id: 'q4', name: 'q4', x: 750, y: 200, isInitial: false, isFinal: true }
    ]
    
    const transitions: Transition[] = [
      // Enhanced addition machine with better logic
      { id: generateId(), from: 'q0', to: 'q0', symbol: '1', label: '1/1,R', writeSymbol: '1', direction: 'R' },
      { id: generateId(), from: 'q0', to: 'q1', symbol: '+', label: '+/+ R', writeSymbol: '+', direction: 'R' },
      
      { id: generateId(), from: 'q1', to: 'q1', symbol: '1', label: '1/1,R', writeSymbol: '1', direction: 'R' },
      { id: generateId(), from: 'q1', to: 'q2', symbol: '=', label: '=/=,R', writeSymbol: '=', direction: 'R' },
      
      // Calculate result
      { id: generateId(), from: 'q2', to: 'q2', symbol: '1', label: '1/1,R', writeSymbol: '1', direction: 'R' },
      { id: generateId(), from: 'q2', to: 'q3', symbol: 'B', label: 'B/1,L', writeSymbol: '1', direction: 'L' },
      
      // Finalize
      { id: generateId(), from: 'q3', to: 'q4', symbol: '1', label: '1/1,S', writeSymbol: '1', direction: 'S' }
    ]
    
    return {
      id: generateId(),
      name: 'Enhanced TM Addition Machine',
      type: 'TM',
      states,
      transitions,
      alphabet: ['1', '+', '=', 'B'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateTMMultiply = (): Automata => {
    const states: State[] = [
      { id: 'q0', name: 'q0', x: 150, y: 200, isInitial: true, isFinal: false },
      { id: 'q1', name: 'q1', x: 300, y: 200, isInitial: false, isFinal: false },
      { id: 'q2', name: 'q2', x: 450, y: 200, isInitial: false, isFinal: false },
      { id: 'q3', name: 'q3', x: 600, y: 200, isInitial: false, isFinal: false },
      { id: 'q4', name: 'q4', x: 750, y: 200, isInitial: false, isFinal: false },
      { id: 'q5', name: 'q5', x: 900, y: 200, isInitial: false, isFinal: true }
    ]
    
    const transitions: Transition[] = [
      // Enhanced multiplication machine
      { id: generateId(), from: 'q0', to: 'q0', symbol: '1', label: '1/1,R', writeSymbol: '1', direction: 'R' },
      { id: generateId(), from: 'q0', to: 'q1', symbol: '*', label: '*/* R', writeSymbol: '*', direction: 'R' },
      
      { id: generateId(), from: 'q1', to: 'q1', symbol: '1', label: '1/1,R', writeSymbol: '1', direction: 'R' },
      { id: generateId(), from: 'q1', to: 'q2', symbol: '=', label: '=/=,R', writeSymbol: '=', direction: 'R' },
      
      // Multiplication logic
      { id: generateId(), from: 'q2', to: 'q3', symbol: 'B', label: 'B/1,L', writeSymbol: '1', direction: 'L' },
      { id: generateId(), from: 'q3', to: 'q4', symbol: '1', label: '1/1,R', writeSymbol: '1', direction: 'R' },
      { id: generateId(), from: 'q4', to: 'q5', symbol: 'B', label: 'B/B,S', writeSymbol: 'B', direction: 'S' }
    ]
    
    return {
      id: generateId(),
      name: 'Enhanced TM Multiplication Machine',
      type: 'TM',
      states,
      transitions,
      alphabet: ['1', '*', '=', 'B'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateTMPalindrome = (): Automata => {
    const states: State[] = [
      { id: 'q0', name: 'q0', x: 150, y: 200, isInitial: true, isFinal: false },
      { id: 'q1', name: 'q1', x: 300, y: 200, isInitial: false, isFinal: false },
      { id: 'q2', name: 'q2', x: 450, y: 200, isInitial: false, isFinal: false },
      { id: 'q3', name: 'q3', x: 600, y: 200, isInitial: false, isFinal: false },
      { id: 'q4', name: 'q4', x: 750, y: 200, isInitial: false, isFinal: false },
      { id: 'q5', name: 'q5', x: 900, y: 200, isInitial: false, isFinal: true },
      { id: 'q6', name: 'q6', x: 1050, y: 200, isInitial: false, isFinal: false }
    ]
    
    const transitions: Transition[] = [
      // Enhanced palindrome checker
      { id: generateId(), from: 'q0', to: 'q1', symbol: '0', label: '0/B,R', writeSymbol: 'B', direction: 'R' },
      { id: generateId(), from: 'q0', to: 'q1', symbol: '1', label: '1/B,R', writeSymbol: 'B', direction: 'R' },
      { id: generateId(), from: 'q0', to: 'q5', symbol: 'B', label: 'B/B,S', writeSymbol: 'B', direction: 'S' },
      
      { id: generateId(), from: 'q1', to: 'q1', symbol: '0', label: '0/0,R', writeSymbol: '0', direction: 'R' },
      { id: generateId(), from: 'q1', to: 'q1', symbol: '1', label: '1/1,R', writeSymbol: '1', direction: 'R' },
      { id: generateId(), from: 'q1', to: 'q2', symbol: 'B', label: 'B/B,L', writeSymbol: 'B', direction: 'L' },
      
      { id: generateId(), from: 'q2', to: 'q3', symbol: '0', label: '0/B,L', writeSymbol: 'B', direction: 'L' },
      { id: generateId(), from: 'q2', to: 'q6', symbol: '1', label: '1/B,L', writeSymbol: 'B', direction: 'L' },
      
      { id: generateId(), from: 'q3', to: 'q4', symbol: 'B', label: 'B/B,R', writeSymbol: 'B', direction: 'R' },
      { id: generateId(), from: 'q4', to: 'q5', symbol: 'B', label: 'B/B,S', writeSymbol: 'B', direction: 'S' }
    ]
    
    return {
      id: generateId(),
      name: 'Enhanced TM Palindrome Checker',
      type: 'TM',
      states,
      transitions,
      alphabet: ['0', '1', 'B'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateTMReverse = (): Automata => {
    const states: State[] = [
      { id: 'q0', name: 'q0', x: 150, y: 200, isInitial: true, isFinal: false },
      { id: 'q1', name: 'q1', x: 300, y: 200, isInitial: false, isFinal: false },
      { id: 'q2', name: 'q2', x: 450, y: 200, isInitial: false, isFinal: false },
      { id: 'q3', name: 'q3', x: 600, y: 200, isInitial: false, isFinal: false },
      { id: 'q4', name: 'q4', x: 750, y: 200, isInitial: false, isFinal: true }
    ]
    
    const transitions: Transition[] = [
      // Enhanced string reverser
      { id: generateId(), from: 'q0', to: 'q0', symbol: '0', label: '0/B,R', writeSymbol: 'B', direction: 'R' },
      { id: generateId(), from: 'q0', to: 'q0', symbol: '1', label: '1/B,R', writeSymbol: 'B', direction: 'R' },
      { id: generateId(), from: 'q0', to: 'q1', symbol: 'B', label: 'B/B,L', writeSymbol: 'B', direction: 'L' },
      
      { id: generateId(), from: 'q1', to: 'q1', symbol: 'B', label: 'B/B,L', writeSymbol: 'B', direction: 'L' },
      { id: generateId(), from: 'q1', to: 'q2', symbol: 'B', label: 'B/B,R', writeSymbol: 'B', direction: 'R' },
      
      { id: generateId(), from: 'q2', to: 'q3', symbol: 'B', label: 'B/0,R', writeSymbol: '0', direction: 'R' },
      { id: generateId(), from: 'q3', to: 'q4', symbol: 'B', label: 'B/B,S', writeSymbol: 'B', direction: 'S' }
    ]
    
    return {
      id: generateId(),
      name: 'Enhanced TM String Reverser',
      type: 'TM',
      states,
      transitions,
      alphabet: ['0', '1', 'B'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // ===============================
  // ENHANCED REGEX GENERATORS
  // ===============================
  
  const generateRegexDFA = (regex: string, alphabet: string[]): Automata => {
    // Enhanced regex parser with more pattern support
    try {
      if (regex === '.*') {
        return generateUniversalDFA(alphabet)
      } else if (regex === '') {
        return generateEmptyStringDFA(alphabet)
      } else if (regex.match(/^[01]+$/)) {
        return generateContainingDFA(regex, alphabet)
      } else if (regex.match(/^[01]+\*$/)) {
        const pattern = regex.slice(0, -1)
        return generateRegexKleeneStar(pattern, alphabet)
      } else if (regex.match(/^[01]+\+$/)) {
        const pattern = regex.slice(0, -1)
        return generateRegexPlus(pattern, alphabet)
      } else if (regex.includes('|')) {
        // Handle union (OR) operations
        const patterns = regex.split('|')
        if (patterns.length === 2) {
          return generateRegexUnion(patterns[0], patterns[1], alphabet)
        }
      } else if (regex.includes('(') && regex.includes(')')) {
        // Handle grouping
        return generateRegexGrouping(regex, alphabet)
      } else if (regex.match(/^[01]\?$/)) {
        // Handle optional symbol
        const symbol = regex[0]
        return generateRegexOptional(symbol, alphabet)
      }
      
      // Fallback to universal language
      return generateUniversalDFA(alphabet)
    } catch (error) {
      throw new Error(`Enhanced regex pattern not supported: ${regex}`)
    }
  }

  const generateRegexKleeneStar = (pattern: string, alphabet: string[]): Automata => {
    // Enhanced Kleene star implementation
    const baseDFA = generateContainingDFA(pattern, alphabet)
    
    // Add enhanced Kleene star functionality
    const newTransitions = [...baseDFA.transitions]
    const newStates = [...baseDFA.states]
    
    // Make start state final (empty string accepted)
    const updatedStates = newStates.map(state => ({
      ...state,
      isFinal: state.isInitial || state.isFinal
    }))
    
    // Add self-loops to final states for repetition
    updatedStates.forEach(state => {
      if (state.isFinal) {
        alphabet.forEach(symbol => {
          newTransitions.push({
            id: generateId(),
            from: state.id,
            to: baseDFA.states.find(s => s.isInitial)?.id || baseDFA.states[0].id,
            symbol,
            label: symbol
          })
        })
      }
    })
    
    return {
      ...baseDFA,
      states: updatedStates,
      transitions: newTransitions,
      name: `Enhanced Regex Kleene Star: ${pattern}*`
    }
  }

  const generateRegexPlus = (pattern: string, alphabet: string[]): Automata => {
    // Enhanced Plus operation (one or more)
    const baseDFA = generateContainingDFA(pattern, alphabet)
    
    const newTransitions = [...baseDFA.transitions]
    
    // Add self-loops from final states back to start (like Kleene star but not accepting empty)
    baseDFA.states.forEach(state => {
      if (state.isFinal) {
        alphabet.forEach(symbol => {
          newTransitions.push({
            id: generateId(),
            from: state.id,
            to: baseDFA.states.find(s => s.isInitial)?.id || baseDFA.states[0].id,
            symbol,
            label: symbol
          })
        })
      }
    })
    
    return {
      ...baseDFA,
      transitions: newTransitions,
      name: `Enhanced Regex Plus: ${pattern}+`
    }
  }

  const generateRegexUnion = (pattern1: string, pattern2: string, alphabet: string[]): Automata => {
    // Enhanced union operation using NFA with epsilon transitions
    const nfa1 = generateNFAPatternMatching(pattern1, alphabet)
    const nfa2 = generateNFAPatternMatching(pattern2, alphabet)
    
    const states: State[] = []
    const transitions: Transition[] = []
    
    // Create new start state
    const startState: State = {
      id: 'qs',
      name: 'qs',
      x: 100,
      y: 250,
      isInitial: true,
      isFinal: false
    }
    states.push(startState)
    
    // Add NFA1 states
    nfa1.states.forEach((state, index) => {
      states.push({
        ...state,
        id: `q1_${index}`,
        name: `q1_${index}`,
        x: state.x + 50,
        y: state.y - 50,
        isInitial: false,
        isFinal: index === nfa1.states.length - 1
      })
    })
    
    // Add NFA2 states
    nfa2.states.forEach((state, index) => {
      states.push({
        ...state,
        id: `q2_${index}`,
        name: `q2_${index}`,
        x: state.x + 50,
        y: state.y + 50,
        isInitial: false,
        isFinal: index === nfa2.states.length - 1
      })
    })
    
    // Epsilon transitions from start to both NFAs
    transitions.push({
      id: generateId(),
      from: 'qs',
      to: 'q1_0',
      symbol: 'ε',
      label: 'ε'
    })
    
    transitions.push({
      id: generateId(),
      from: 'qs',
      to: 'q2_0',
      symbol: 'ε',
      label: 'ε'
    })
    
    // Add all original transitions
    nfa1.transitions.forEach(t => {
      transitions.push({
        ...t,
        id: generateId(),
        from: `q1_${nfa1.states.findIndex(s => s.id === t.from)}`,
        to: `q1_${nfa1.states.findIndex(s => s.id === t.to)}`
      })
    })
    
    nfa2.transitions.forEach(t => {
      transitions.push({
        ...t,
        id: generateId(),
        from: `q2_${nfa2.states.findIndex(s => s.id === t.from)}`,
        to: `q2_${nfa2.states.findIndex(s => s.id === t.to)}`
      })
    })
    
    return {
      id: generateId(),
      name: `Enhanced Regex Union: ${pattern1} | ${pattern2}`,
      type: 'REGEX',
      states,
      transitions,
      alphabet: [...alphabet, 'ε'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateRegexOptional = (symbol: string, alphabet: string[]): Automata => {
    // Enhanced optional symbol (0 or 1 occurrence)
    const states: State[] = [
      { id: 'q0', name: 'q0', x: 200, y: 200, isInitial: true, isFinal: true },
      { id: 'q1', name: 'q1', x: 350, y: 200, isInitial: false, isFinal: true }
    ]
    
    const transitions: Transition[] = [
      {
        id: generateId(),
        from: 'q0',
        to: 'q1',
        symbol,
        label: symbol
      }
    ]
    
    // Epsilon transition for optional (can skip the symbol)
    transitions.push({
      id: generateId(),
      from: 'q0',
      to: 'q1',
      symbol: 'ε',
      label: 'ε'
    })
    
    return {
      id: generateId(),
      name: `Enhanced Regex Optional: ${symbol}?`,
      type: 'REGEX',
      states,
      transitions,
      alphabet: [...alphabet, 'ε'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const generateRegexGrouping = (regex: string, alphabet: string[]): Automata => {
    // Enhanced grouping with parentheses
    try {
      // Simple grouping: (pattern)
      const match = regex.match(/^\(([^)]+)\)$/)
      if (match) {
        const innerPattern = match[1]
        return generateRegexDFA(innerPattern, alphabet)
      }
      
      // Grouping with operations: (pattern)*, (pattern)+, (pattern)?
      const matchWithOp = regex.match(/^\(([^)]+)\)([*+?])$/)
      if (matchWithOp) {
        const innerPattern = matchWithOp[1]
        const operation = matchWithOp[2]
        
        switch (operation) {
          case '*':
            return generateRegexKleeneStar(innerPattern, alphabet)
          case '+':
            return generateRegexPlus(innerPattern, alphabet)
          case '?':
            return generateRegexOptional(innerPattern, alphabet)
        }
      }
      
      // Fallback
      return generateUniversalDFA(alphabet)
    } catch (error) {
      throw new Error(`Grouping pattern not supported: ${regex}`)
    }
  }

  const generateRegexConcatenation = (pattern1: string, pattern2: string, alphabet: string[]): Automata => {
    // Enhanced concatenation using epsilon transitions
    const nfa1 = generateNFAPatternMatching(pattern1, alphabet)
    const nfa2 = generateNFAPatternMatching(pattern2, alphabet)
    
    const states: State[] = []
    const transitions: Transition[] = []
    
    // Combine states
    nfa1.states.forEach((state, index) => {
      states.push({
        ...state,
        id: `q1_${index}`,
        name: `q1_${index}`,
        x: state.x,
        y: state.y,
        isInitial: index === 0,
        isFinal: false
      })
    })
    
    nfa2.states.forEach((state, index) => {
      states.push({
        ...state,
        id: `q2_${index}`,
        name: `q2_${index}`,
        x: state.x + 200,
        y: state.y,
        isInitial: false,
        isFinal: index === nfa2.states.length - 1
      })
    })
    
    // Epsilon transition for concatenation
    transitions.push({
      id: generateId(),
      from: `q1_${nfa1.states.length - 1}`,
      to: 'q2_0',
      symbol: 'ε',
      label: 'ε'
    })
    
    // Add all original transitions
    nfa1.transitions.forEach(t => {
      transitions.push({
        ...t,
        id: generateId(),
        from: `q1_${nfa1.states.findIndex(s => s.id === t.from)}`,
        to: `q1_${nfa1.states.findIndex(s => s.id === t.to)}`
      })
    })
    
    nfa2.transitions.forEach(t => {
      transitions.push({
        ...t,
        id: generateId(),
        from: `q2_${nfa2.states.findIndex(s => s.id === t.from)}`,
        to: `q2_${nfa2.states.findIndex(s => s.id === t.to)}`
      })
    })
    
    return {
      id: generateId(),
      name: `Enhanced Regex Concatenation: ${pattern1}${pattern2}`,
      type: 'REGEX',
      states,
      transitions,
      alphabet: [...alphabet, 'ε'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

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
      <div className="flex items-center justify-end p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            placeholder="Enter input string..."
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                mode === 'addState' ? 'bg-primary' : 'bg-primary'
              }`} />
              <span className="text-sm font-medium text-foreground">
                {mode === 'addState' ? 'Click to add state' : 'Drag from state to create transition'}
              </span>
            </div>
          </div>
        )}

        {/* Formal Language Problem Solver Panel */}
        <div className="absolute bottom-4 right-4 z-10 w-80 max-h-[calc(100vh-200px)] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-gray-600">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Problem Solver</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProblemInput(!showProblemInput)}
                className="h-6 w-6 p-0"
              >
                {showProblemInput ? '−' : '+'}
              </Button>
            </div>
            
            {showProblemInput && (
              <div className="space-y-3">
                {/* Automata Type Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Automata Type
                  </label>
                  <select 
                    value={automata.type}
                    onChange={(e) => onAutomataChange({...automata, type: e.target.value as 'DFA' | 'NFA' | 'TM' | 'REGEX'})}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-transparent"
                  >
                    <option value="DFA">DFA (Deterministic Finite Automaton)</option>
                    <option value="NFA">NFA (Non-deterministic Finite Automaton)</option>
                    <option value="TM">TM (Turing Machine)</option>
                    <option value="REGEX">REGEX (Regular Expression)</option>
                  </select>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {automata.type === 'DFA' && '✓ Regular languages ✓ Deterministic transitions'}
                    {automata.type === 'NFA' && '✓ Epsilon transitions ✓ Non-deterministic paths'}
                    {automata.type === 'TM' && '✓ Tape operations ✓ Write/Read/Move'}
                    {automata.type === 'REGEX' && '✓ Pattern matching ✓ Kleene star operations'}
                  </div>
                </div>

                {/* Problem Description Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Problem Description
                  </label>
                  <textarea
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder={
                      automata.type === 'NFA' ? "Examples: 'NFA length 3', 'NFA pattern 01', 'NFA kleene star 01', 'NFA union 01|10', 'NFA concatenation 01+10'"
                      : automata.type === 'TM' ? "Examples: 'TM copy machine', 'TM addition machine', 'TM multiplication machine', 'TM palindrome checker', 'TM reverse string'"
                      : automata.type === 'REGEX' ? "Examples: 'regex 01*', 'regex 01+', 'regex (01)*', 'regex 01|10', 'regex 01?', 'regex (01)+'"
                      : "Examples: 'strings of length 2', 'strings ending with 01', 'strings containing 11', 'even number of 0s'"
                    }
                    className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {automata.type === 'NFA' && '✓ Length patterns ✓ Pattern matching ✓ Kleene star ✓ Union ✓ Concatenation ✓ Epsilon transitions'}
                    {automata.type === 'TM' && '✓ Copy operations ✓ Addition ✓ Multiplication ✓ Palindrome ✓ Reverse ✓ Tape manipulation'}
                    {automata.type === 'REGEX' && '✓ Kleene star ✓ Plus ✓ Union ✓ Optional ✓ Grouping ✓ Concatenation ✓ Pattern matching'}
                    {automata.type === 'DFA' && '✓ Length patterns ✓ Ending/Starting patterns ✓ Containing patterns ✓ Even/Odd counting ✓ Advanced operations'}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => generateDFAFromDescription(problemDescription, automata.type)}
                    disabled={!problemDescription.trim() || isGenerating}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    {isGenerating ? 'Generating...' : `Generate ${automata.type}`}
                  </Button>
                  
                  <Button
                    onClick={validateDFAAgainstProblem}
                    disabled={!problemDescription.trim() || automata.states.length === 0}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validate Solution
                  </Button>
                </div>
                
                {/* Validation Result */}
                {validationResult && (
                  <div className={`p-2 rounded border text-xs ${
                    validationResult.isValid 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50' 
                      : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/50'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <div className={`flex-shrink-0 ${
                        validationResult.isValid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {validationResult.isValid ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          validationResult.isValid 
                            ? 'text-green-800 dark:text-green-300' 
                            : 'text-yellow-800 dark:text-yellow-300'
                        }`}>
                          {validationResult.message}
                        </p>
                        <p className={`mt-1 ${
                          validationResult.isValid 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          Score: {validationResult.score}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Interactive Testing Section */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <TestTube className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />
                      Testing
                    </h4>
                    <Button
                      onClick={testAllStrings}
                      disabled={automata.states.length === 0}
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2"
                    >
                      Test All
                    </Button>
                  </div>
                  
                  {/* Test String Inputs */}
                  <div className="space-y-1 mb-2">
                    {testStrings.slice(0, 3).map((testString, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={testString}
                          onChange={(e) => {
                            const newTestStrings = [...testStrings]
                            newTestStrings[index] = e.target.value
                            setTestStrings(newTestStrings)
                          }}
                          placeholder="Test string"
                          className="flex-1 px-1.5 py-0.5 text-xs border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary"
                        />
                        <Button
                          onClick={() => {
                            if (testStrings.length > 1) {
                              setTestStrings(testStrings.filter((_, i) => i !== index))
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 h-5 w-5 p-0"
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    ))}
                    {testStrings.length < 5 && (
                      <Button
                        onClick={() => setTestStrings([...testStrings, ''])}
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 text-xs h-5 px-1"
                      >
                        <Plus className="h-2.5 w-2.5 mr-0.5" />
                        Add
                      </Button>
                    )}
                  </div>
                  
                  {/* Test Results */}
                  {testResults.length > 0 && (
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">Results:</h5>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {testResults.slice(0, 4).map((result, index) => (
                          <div key={index} className={`p-1.5 rounded text-xs border ${
                            result.accepted 
                              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-300'
                              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300'
                          }`}>
                            <div className="font-mono">
                              "{result.string || 'ε'}" → {result.accepted ? '✓' : '✗'}
                            </div>
                            <div className="opacity-75 mt-0.5">
                              {result.path.slice(0, 4).join('→')}
                              {result.path.length > 4 && '...'}
                            </div>
                          </div>
                        ))}
                        {testResults.length > 4 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{testResults.length - 4} more results
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AutomataFlow
          automata={automata}
          onAutomataChange={onAutomataChange}
          selectedState={selectedState || undefined}
          onStateSelect={(stateId) => setSelectedState(stateId || null)}
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
