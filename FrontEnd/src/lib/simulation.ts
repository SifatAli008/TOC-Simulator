import { State, Transition, Automata, SimulationStep, SimulationResult } from '@/types/automata'

export class SimulationEngine {
  private automata: Automata

  constructor(automata: Automata) {
    this.automata = automata
  }

  simulate(input: string): SimulationResult {
    const startTime = performance.now()
    const steps: SimulationStep[] = []
    
    if (this.automata.type === 'DFA') {
      return this.simulateDFA(input, steps, startTime)
    } else if (this.automata.type === 'NFA') {
      return this.simulateNFA(input, steps, startTime)
    } else if (this.automata.type === 'REGEX') {
      return this.simulateRegex(input, steps, startTime)
    } else if (this.automata.type === 'TM') {
      return this.simulateTM(input, steps, startTime)
    }
    
    return {
      input,
      steps,
      isAccepted: false,
      executionTime: performance.now() - startTime
    }
  }

  private simulateDFA(input: string, steps: SimulationStep[], startTime: number): SimulationResult {
    const initialState = this.automata.states.find(s => s.isInitial)
    if (!initialState) {
      return {
        input,
        steps: [{
          step: 0,
          currentState: 'No initial state',
          remainingInput: input,
          isAccepted: false
        }],
        isAccepted: false,
        executionTime: performance.now() - startTime
      }
    }

    let currentState = initialState
    let remainingInput = input
    let stepNumber = 0

    // Initial step
    steps.push({
      step: stepNumber++,
      currentState: currentState.id,
      remainingInput,
      isAccepted: false
    })

    // Process each character
    for (let i = 0; i < input.length; i++) {
      const symbol = input[i]
      const transition = this.automata.transitions.find(
        t => t.from === currentState.id && t.symbol === symbol
      )

      if (!transition) {
        steps.push({
          step: stepNumber++,
          currentState: currentState.id,
          remainingInput: remainingInput.substring(1),
          isAccepted: false
        })
        break
      }

      const nextState = this.automata.states.find(s => s.id === transition.to)
      if (!nextState) break

      steps.push({
        step: stepNumber++,
        currentState: nextState.id,
        remainingInput: remainingInput.substring(1),
        isAccepted: false,
        transition
      })

      currentState = nextState
      remainingInput = remainingInput.substring(1)
    }

    const isAccepted = currentState.isFinal && remainingInput === ''
    
    // Final step
    steps.push({
      step: stepNumber++,
      currentState: currentState.id,
      remainingInput,
      isAccepted
    })

    return {
      input,
      steps,
      isAccepted,
      executionTime: performance.now() - startTime
    }
  }

  private simulateNFA(input: string, steps: SimulationStep[], startTime: number): SimulationResult {
    const initialState = this.automata.states.find(s => s.isInitial)
    if (!initialState) {
      return {
        input,
        steps: [{
          step: 0,
          currentState: 'No initial state',
          remainingInput: input,
          isAccepted: false
        }],
        isAccepted: false,
        executionTime: performance.now() - startTime
      }
    }

    let currentStates = new Set([initialState.id])
    let remainingInput = input
    let stepNumber = 0

    // Initial step
    steps.push({
      step: stepNumber++,
      currentState: Array.from(currentStates).join(', '),
      remainingInput,
      isAccepted: false
    })

    // Process each character
    for (let i = 0; i < input.length; i++) {
      const symbol = input[i]
      const nextStates = new Set<string>()

      for (const stateId of currentStates) {
        const transitions = this.automata.transitions.filter(
          t => t.from === stateId && t.symbol === symbol
        )
        
        for (const transition of transitions) {
          nextStates.add(transition.to)
        }
      }

      if (nextStates.size === 0) {
        steps.push({
          step: stepNumber++,
          currentState: Array.from(currentStates).join(', '),
          remainingInput: remainingInput.substring(1),
          isAccepted: false
        })
        break
      }

      steps.push({
        step: stepNumber++,
        currentState: Array.from(nextStates).join(', '),
        remainingInput: remainingInput.substring(1),
        isAccepted: false
      })

      currentStates = nextStates
      remainingInput = remainingInput.substring(1)
    }

    // Check if any current state is final
    const isAccepted = Array.from(currentStates).some(stateId => {
      const state = this.automata.states.find(s => s.id === stateId)
      return state?.isFinal && remainingInput === ''
    })

    // Final step
    steps.push({
      step: stepNumber++,
      currentState: Array.from(currentStates).join(', '),
      remainingInput,
      isAccepted
    })

    return {
      input,
      steps,
      isAccepted,
      executionTime: performance.now() - startTime
    }
  }

  private simulateRegex(input: string, _steps: SimulationStep[], _startTime: number): SimulationResult {
    // Convert regex to NFA and then simulate
    // This is a simplified implementation
    const nfa = this.regexToNFA(this.automata.alphabet[0] || '')
    const nfaSimulator = new SimulationEngine(nfa)
    return nfaSimulator.simulate(input)
  }

  private simulateTM(input: string, steps: SimulationStep[], startTime: number): SimulationResult {
    const initialState = this.automata.states.find(s => s.isInitial)
    if (!initialState) {
      return {
        input,
        steps: [{
          step: 0,
          currentState: 'No initial state',
          remainingInput: input,
          isAccepted: false
        }],
        isAccepted: false,
        executionTime: performance.now() - startTime
      }
    }

    // Initialize tape with input and blank symbols
    const tape = input.split('')
    let tapePosition = 0
    let currentState = initialState
    let stepNumber = 0
    const maxSteps = 1000 // Prevent infinite loops

    // Initial step
    steps.push({
      step: stepNumber++,
      currentState: currentState.id,
      remainingInput: input,
      isAccepted: false,
      tapePosition,
      tape: [...tape],
      tapeHead: tape[tapePosition] || 'B' // B for blank
    })

    // Process until halt or max steps
    while (stepNumber < maxSteps) {
      const currentSymbol = tape[tapePosition] || 'B'
      const transition = this.automata.transitions.find(
        t => t.from === currentState.id && 
             (t.readSymbol === currentSymbol || t.symbol === currentSymbol)
      )

      if (!transition) {
        // No transition found - halt
        steps.push({
          step: stepNumber++,
          currentState: currentState.id,
          remainingInput: '',
          isAccepted: currentState.isFinal,
          tapePosition,
          tape: [...tape],
          tapeHead: currentSymbol
        })
        break
      }

      // Write symbol to tape
      if (transition.writeSymbol !== undefined) {
        tape[tapePosition] = transition.writeSymbol
      }

      // Move tape head
      if (transition.direction === 'L') {
        tapePosition = Math.max(0, tapePosition - 1)
      } else if (transition.direction === 'R') {
        tapePosition++
      }
      // 'S' means stay in the same position

      // Update current state
      const nextState = this.automata.states.find(s => s.id === transition.to)
      if (!nextState) break

      currentState = nextState

      // Add step
      steps.push({
        step: stepNumber++,
        currentState: currentState.id,
        remainingInput: '',
        isAccepted: currentState.isFinal,
        transition,
        tapePosition,
        tape: [...tape],
        tapeHead: tape[tapePosition] || 'B'
      })

      // Check if we're in a final state
      if (currentState.isFinal) {
        break
      }
    }

    const isAccepted = currentState.isFinal

    return {
      input,
      steps,
      isAccepted,
      executionTime: performance.now() - startTime
    }
  }

  private regexToNFA(regex: string): Automata {
    // Simplified regex to NFA conversion
    // This would need a proper regex parser in a real implementation
    const states: State[] = [
      { id: 'q0', name: 'q0', x: 100, y: 100, isInitial: true, isFinal: false },
      { id: 'q1', name: 'q1', x: 200, y: 100, isInitial: false, isFinal: true }
    ]
    
    const transitions: Transition[] = [
      { id: 't0', from: 'q0', to: 'q1', symbol: regex, label: regex }
    ]

    return {
      id: generateId(),
      name: 'Regex NFA',
      type: 'NFA',
      states,
      transitions,
      alphabet: [regex],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
