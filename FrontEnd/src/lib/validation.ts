import { Automata } from '@/types/automata'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class AutomataValidator {
  static validateAutomata(automata: Automata): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if automata has states
    if (!automata.states || automata.states.length === 0) {
      errors.push('Automaton must have at least one state')
    }

    // Check for initial state
    const initialStates = automata.states.filter(s => s.isInitial)
    if (initialStates.length === 0) {
      errors.push('Automaton must have exactly one initial state')
    } else if (initialStates.length > 1) {
      errors.push('Automaton must have exactly one initial state')
    }

    // Check for final states
    const finalStates = automata.states.filter(s => s.isFinal)
    if (finalStates.length === 0) {
      warnings.push('Automaton has no final states - it will never accept any input')
    }

    // Validate states
    for (const state of automata.states) {
      if (!state.id || !state.name) {
        errors.push(`State ${state.id || 'unknown'} is missing required properties`)
      }

      if (state.x < 0 || state.y < 0) {
        warnings.push(`State ${state.name} has negative coordinates`)
      }
    }

    // Validate transitions
    for (const transition of automata.transitions) {
      if (!transition.id || !transition.from || !transition.to || !transition.symbol) {
        errors.push(`Transition ${transition.id || 'unknown'} is missing required properties`)
      }

      // Check if from and to states exist
      const fromState = automata.states.find(s => s.id === transition.from)
      const toState = automata.states.find(s => s.id === transition.to)

      if (!fromState) {
        errors.push(`Transition ${transition.id} references non-existent state: ${transition.from}`)
      }

      if (!toState) {
        errors.push(`Transition ${transition.id} references non-existent state: ${transition.to}`)
      }

      // Check if symbol is in alphabet
      if (transition.symbol && !automata.alphabet.includes(transition.symbol)) {
        warnings.push(`Transition ${transition.id} uses symbol '${transition.symbol}' not in alphabet`)
      }
    }

    // Type-specific validation
    switch (automata.type) {
      case 'DFA':
        this.validateDFA(automata, errors, warnings)
        break
      case 'NFA':
        this.validateNFA(automata, errors, warnings)
        break
      case 'TM':
        this.validateTM(automata, errors, warnings)
        break
      case 'REGEX':
        this.validateRegex(automata, errors, warnings)
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private static validateDFA(automata: Automata, errors: string[], warnings: string[]) {
    // Check for deterministic transitions
    const stateTransitions = new Map<string, Map<string, string>>()
    
    for (const transition of automata.transitions) {
      if (!stateTransitions.has(transition.from)) {
        stateTransitions.set(transition.from, new Map())
      }
      
      const transitions = stateTransitions.get(transition.from)!
      if (transitions.has(transition.symbol)) {
        errors.push(`DFA violation: State ${transition.from} has multiple transitions for symbol '${transition.symbol}'`)
      }
      transitions.set(transition.symbol, transition.to)
    }

    // Check if all states have transitions for all alphabet symbols
    for (const state of automata.states) {
      const transitions = stateTransitions.get(state.id)
      if (transitions) {
        for (const symbol of automata.alphabet) {
          if (!transitions.has(symbol)) {
            warnings.push(`State ${state.name} has no transition for symbol '${symbol}'`)
          }
        }
      }
    }
  }

  private static validateNFA(automata: Automata, errors: string[], warnings: string[]) {
    // NFA can have multiple transitions for the same symbol
    // No specific validation needed beyond basic checks
  }

  private static validateTM(automata: Automata, errors: string[], warnings: string[]) {
    // Check for Turing Machine specific properties
    for (const transition of automata.transitions) {
      if (transition.readSymbol === undefined && transition.symbol === undefined) {
        errors.push(`Turing Machine transition ${transition.id} must specify read symbol`)
      }

      if (transition.writeSymbol === undefined) {
        warnings.push(`Turing Machine transition ${transition.id} should specify write symbol`)
      }

      if (transition.direction === undefined) {
        errors.push(`Turing Machine transition ${transition.id} must specify direction (L/R/S)`)
      } else if (!['L', 'R', 'S'].includes(transition.direction)) {
        errors.push(`Turing Machine transition ${transition.id} has invalid direction: ${transition.direction}`)
      }
    }
  }

  private static validateRegex(automata: Automata, _errors: string[], warnings: string[]) {
    // Regex validation would be more complex in a real implementation
    // For now, just basic checks
    if (automata.alphabet.length === 0) {
      warnings.push('Regular expression has no alphabet defined')
    }
  }

  static validateInputString(input: string, alphabet: string[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (input.length > 1000) {
      warnings.push('Input string is very long - this may cause performance issues')
    }

    for (let i = 0; i < input.length; i++) {
      const char = input[i]
      if (!alphabet.includes(char)) {
        errors.push(`Character '${char}' at position ${i} is not in the alphabet`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}
