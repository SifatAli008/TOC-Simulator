export interface State {
  id: string;
  name: string;
  x: number;
  y: number;
  isInitial: boolean;
  isFinal: boolean;
  isActive?: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbol: string;
  label?: string;
  // Turing Machine specific properties
  readSymbol?: string;
  writeSymbol?: string;
  direction?: 'L' | 'R' | 'S'; // Left, Right, Stay
}

export interface Automata {
  id: string;
  name: string;
  type: 'DFA' | 'NFA' | 'TM' | 'REGEX';
  states: State[];
  transitions: Transition[];
  alphabet: string[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface SimulationStep {
  step: number;
  currentState: string;
  remainingInput: string;
  isAccepted: boolean;
  transition?: Transition;
  // Turing Machine specific properties
  tapePosition?: number;
  tape?: string[];
  tapeHead?: string;
}

export interface SimulationResult {
  input: string;
  steps: SimulationStep[];
  isAccepted: boolean;
  executionTime: number;
}

export interface ConversionResult {
  original: Automata;
  converted: Automata;
  steps: string[];
  executionTime: number;
}
